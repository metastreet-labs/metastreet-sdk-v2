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

  /* Prune nodes that contribute less than 1% to total amount */
  readonly PRUNE_AMOUNT_BASIS_POINTS = 100n;

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

  _aggregateNodes(nodes: DecodedLiquidityNode[]): DecodedLiquidityNode[][] {
    const aggregatedNodes: DecodedLiquidityNode[][] = [];

    /* Aggregate all nodes with same limit */
    let prevLimit = -1n;
    for (const node of nodes) {
      if (node.tick.limit == prevLimit) {
        aggregatedNodes[aggregatedNodes.length - 1].push(node);
      } else {
        aggregatedNodes.push([node]);
        prevLimit = node.tick.limit;
      }
    }

    return aggregatedNodes;
  }

  _traverseNodes(
    aggregatedNodes: DecodedLiquidityNode[][],
    multiplier: number,
  ): { amount: bigint; route: DecodedLiquidityNode[] } {
    /* Helper function to calculate liquidity available along a set of nodes
     * and its cost */
    function scoreSubroute(nodes: DecodedLiquidityNode[], offset: bigint): { available: bigint; cost: bigint } {
      let available = 0n;
      let cost = 0n;

      for (const node of nodes) {
        const take = minBigInt(node.tick.limit * BigInt(multiplier) - (available + offset), node.available);
        available += take;
        cost += take * BigInt(node.tick.rate + 1);
      }

      return { available, cost };
    }

    /* Cumulative amount and route taken */
    let amount = 0n;
    const route: DecodedLiquidityNode[] = [];

    /* For each aggregation of nodes at a loan limit */
    for (let i = 0; i < aggregatedNodes.length; i++) {
      /* Get next set of aggregated nodes */
      const nextAggregatedNodes = i + 1 < aggregatedNodes.length ? aggregatedNodes[i + 1] : null;

      /* Collect scores of all nodes at this loan limit combined with nodes
       * in the next loan limit */
      const scores = aggregatedNodes[i].flatMap((a) =>
        nextAggregatedNodes
          ? nextAggregatedNodes.map((b) => ({ ...scoreSubroute([a, b], amount), node: a }))
          : { ...scoreSubroute([a], amount), node: a },
      );

      /* Find best score with highest amount at lowest cost */
      const bestScore = scores.reduce(
        (bestScore, score) =>
          score.available > bestScore.available ||
          (score.available == bestScore.available && score.cost < bestScore.cost)
            ? score
            : bestScore,
        scores[0],
      );

      /* Update cumulative amount and route along best score node */
      amount += minBigInt(bestScore.node.tick.limit * BigInt(multiplier) - amount, bestScore.node.available);
      route.push(bestScore.node);
    }

    return { amount, route };
  }

  _pruneNodes(nodes: DecodedLiquidityNode[], amount: bigint): DecodedLiquidityNode[] {
    /* Prune nodes that can contribute less than a threshold to the total amount */
    return nodes.filter((n) => n.available > (amount * this.PRUNE_AMOUNT_BASIS_POINTS) / 10000n);
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
    /* Decode, filter, aggregate, and traverse nodes for maximum amount along best route */
    const { amount, route } = this._traverseNodes(
      this._aggregateNodes(this._filterNodes(this._decodeNodes(nodes), duration)),
      multiplier,
    );

    /* Prune the route */
    const prunedRoute = this._pruneNodes(route, amount);

    /* Limit nodes in route */
    const limitedPrunedRoute = this._limitNodes(prunedRoute, numNodes);

    /* Source maximum liquidity from nodes */
    return this._sourceNodes(limitedPrunedRoute, 2n ** 120n - 1n, multiplier)[0];
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
    /* Decode, filter, aggregate, and traverse nodes for maximum amount along best route */
    const { route, ..._ } = this._traverseNodes(
      this._aggregateNodes(this._filterNodes(this._decodeNodes(nodes), duration)),
      multiplier,
    );

    /* Prune the route */
    const prunedRoute = this._pruneNodes(route, amount);

    /* Limit nodes in route */
    const limitedPrunedRoute = this._limitNodes(prunedRoute, numNodes);

    /* Check sufficient liquidity is available in limited, pruned route */
    if (this._sourceNodes(limitedPrunedRoute, amount, multiplier)[0] != amount) {
      throw new Error(`Insufficient liquidity for ${amount} amount.`);
    }

    return limitedPrunedRoute.map((n) => TickEncoder.encode(n.tick));
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
