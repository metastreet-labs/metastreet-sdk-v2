import { EncodedTick, DecodedTick, TickEncoder } from './Tick';

export interface LiquidityNode {
  tick: EncodedTick;
  available: bigint;
}

interface DecodedLiquidityNode {
  tick: DecodedTick;
  available: bigint;
}

function minBigInt(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

export class TickRouter {
  readonly durations: number[];
  readonly rates: bigint[];

  /* Fixed point scale */
  readonly FIXED_POINT_SCALE = 10n ** 18n;

  /****************************************************************************/
  /* Constructor */
  /****************************************************************************/

  /**
   * Constructor
   * @param durations Durations in seconds (ascending)
   * @param rates Rates in interest per second (ascending)
   */
  constructor(durations: number[], rates: bigint[]) {
    this.durations = durations;
    this.rates = rates;
  }

  /****************************************************************************/
  /* Internal Helpers */
  /****************************************************************************/

  _decodeNodes(nodes: LiquidityNode[]): DecodedLiquidityNode[] {
    /* Decode tick in each node */
    return nodes.map((n) => ({ tick: TickEncoder.decode(n.tick), available: n.available }));
  }

  _filterNodes(nodes: DecodedLiquidityNode[], duration: number): DecodedLiquidityNode[] {
    /* Map duration to duration index */
    let durationIndex = this.durations.findIndex((d) => duration <= d);
    durationIndex = durationIndex == -1 ? Infinity : durationIndex;

    /* Filter out nodes with durations exceeding input duration */
    return nodes.filter((n) => n.tick.duration >= durationIndex);
  }

  _traverseNodes(nodes: DecodedLiquidityNode[], multiplier: number): { amount: bigint; route: DecodedLiquidityNode[] } {
    /* Cumulative amount and route taken */
    let amount = 0n;
    const route: DecodedLiquidityNode[] = [];

    while (true) {
      /* Filter available nodes by tick limit and monotonic tick */
      const availableNodes = nodes.filter((node) => {
        return (
          node.available > 0n &&
          node.tick.limit * BigInt(multiplier) > amount &&
          TickEncoder.encode(node.tick) > (route.length == 0 ? 0n : TickEncoder.encode(route[route.length - 1].tick))
        );
      });

      /* If no nodes are available, break */
      if (availableNodes.length === 0) break;

      /* Sort nodes by cost of capital and duration */
      availableNodes.sort((a: DecodedLiquidityNode, b: DecodedLiquidityNode): number =>
        TickEncoder.encode(a.tick) <= TickEncoder.encode(b.tick) ? -1 : 1,
      );

      /* Pick best scoring node */
      const bestNode = availableNodes[0];

      /* Update cumulative amount and route */
      amount += minBigInt(bestNode.tick.limit * BigInt(multiplier) - amount, bestNode.available);
      route.push(bestNode);
    }

    return { amount, route };
  }

  _pruneNodes(
    nodes: DecodedLiquidityNode[],
    amount: bigint,
    multiplier: number,
    count: number,
  ): DecodedLiquidityNode[] {
    /* Source liquidity from all nodes */
    const [_, sources] = this._sourceNodes(nodes, amount, multiplier);

    /* Sort node indices by contribution */
    const sortedIndices = [...Array(sources.length).keys()].sort((i: number, j: number): number =>
      sources[i] > sources[j] ? -1 : sources[i] < sources[j] ? 1 : i > j ? -1 : 1,
    );

    /* Limit node indices to count and sort indices for ascending ticks */
    const limitedSortedIndices = sortedIndices.slice(0, count).sort();

    /* Map limited, sorted node indices back to nodes */
    return limitedSortedIndices.map((i) => nodes[i]);
  }

  _limitNodes(nodes: DecodedLiquidityNode[], count: number): DecodedLiquidityNode[] {
    return nodes.splice(-count);
  }

  _sourceNodes(nodes: DecodedLiquidityNode[], amount: bigint, multiplier: number): [bigint, bigint[]] {
    /* Source as much liquidity from nodes as possible, up to the limit, amount
     * available, and amount remaining */
    const sources: bigint[] = [];
    let taken = 0n;
    for (const node of nodes) {
      const take = minBigInt(minBigInt(node.tick.limit * BigInt(multiplier) - taken, node.available), amount - taken);
      sources.push(take);
      taken += take;
    }

    return [taken, sources];
  }

  /****************************************************************************/
  /* Public API */
  /****************************************************************************/

  /**
   * Forecast liquidity available.
   * @param nodes Liquidity nodes
   * @param duration Duration in seconds
   * @param multiplier Multiplier in amount
   * @param numNodes Number of liquidity nodes to use (maximum)
   * @returns Liquidity available
   */
  forecast(nodes: LiquidityNode[], duration: number, multiplier: number = 1, numNodes: number = 10): bigint {
    /* Decode, filter, and traverse nodes for maximum amount along best route */
    const { amount, route } = this._traverseNodes(this._filterNodes(this._decodeNodes(nodes), duration), multiplier);

    /* Limit nodes in route */
    const prunedRoute = this._pruneNodes(route, amount, multiplier, numNodes);

    /* Source maximum liquidity from nodes */
    return this._sourceNodes(prunedRoute, 2n ** 120n - 1n, multiplier)[0];
  }

  /**
   * Route amount to liquidity nodes.
   * @param nodes Liquidity nodes
   * @param amount Total amount
   * @param duration Duration in seconds
   * @param multiplier Multiplier in amount
   * @param numNodes Number of liquidity nodes to use (maximum)
   * @returns Encoded ticks
   */
  route(
    nodes: LiquidityNode[],
    amount: bigint,
    duration: number,
    multiplier: number = 1,
    numNodes: number = 10,
  ): EncodedTick[] {
    /* Decode, filter, and traverse nodes for maximum amount along best route */
    const { route, ..._ } = this._traverseNodes(this._filterNodes(this._decodeNodes(nodes), duration), multiplier);

    /* Limit nodes in route */
    const prunedRoute = this._pruneNodes(route, amount, multiplier, numNodes);

    /* Check sufficient liquidity is available in pruned route */
    if (this._sourceNodes(prunedRoute, amount, multiplier)[0] != amount) {
      throw new Error(`Insufficient liquidity for ${amount} amount.`);
    }

    return prunedRoute.map((n) => TickEncoder.encode(n.tick));
  }

  /**
   * Quote repayment for amount.
   * @param nodes Liquidity nodes
   * @param ticks Ticks to use
   * @param amount Total amount
   * @param duration Duration in seconds
   * @param multiplier Multiplier in amount
   * @returns Repayment amount
   */
  quote(
    nodes: LiquidityNode[],
    ticks: EncodedTick[],
    amount: bigint,
    duration: number,
    multiplier: number = 1,
  ): bigint {
    /* Handle zero case */
    if (amount == 0n) return 0n;

    /* Reconstruct route from selected ticks */
    const route = this._decodeNodes(nodes.filter((n) => ticks.includes(n.tick)));

    /* Source liquidity from nodes */
    const [total, sources] = this._sourceNodes(route, amount, multiplier);

    /* Check sufficient liquidity is available */
    if (total != amount) {
      throw new Error(`Insufficient liquidity for ${amount} amount.`);
    }

    /* Accumulate weighted rate */
    let weightedRate: bigint = 0n;
    for (let i = 0; i < sources.length; i++) {
      weightedRate += (sources[i] * this.rates[route[i].tick.rate]) / this.FIXED_POINT_SCALE;
    }

    /* Normalize weighted rate by amount */
    weightedRate = (weightedRate * this.FIXED_POINT_SCALE) / amount;

    /* Calculate repayment */
    const repayment = (amount * (this.FIXED_POINT_SCALE + weightedRate * BigInt(duration))) / this.FIXED_POINT_SCALE;

    return repayment;
  }
}
