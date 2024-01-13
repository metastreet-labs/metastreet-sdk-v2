import { EncodedTick, DecodedTick, LimitType, TickEncoder } from './Tick';

export interface LiquidityNode {
  tick: EncodedTick;
  available: bigint;

  /* Additional fields needed to process redemptions in apply() */
  value?: bigint;
  shares?: bigint;
  redemptions?: bigint;
}

export interface NodeReceipt {
  tick: EncodedTick;
  used: bigint;
  pending: bigint;
}

interface DecodedLiquidityNode {
  tick: DecodedTick;
  limit: bigint;
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
   * @param durations Durations in seconds (ascending for v1, descending for v2)
   * @param rates Rates in interest per second (ascending)
   */
  constructor(durations: number[], rates: bigint[]) {
    this.durations = durations;
    this.rates = rates;
  }

  /****************************************************************************/
  /* Internal Helpers */
  /****************************************************************************/

  _decodeNodes(nodes: LiquidityNode[], collateralValue: bigint = 0n): DecodedLiquidityNode[] {
    /* Decode tick in each node */
    return nodes.map((n) => {
      const tick = TickEncoder.decode(n.tick);
      const limit =
        tick.limitType === LimitType.Absolute ? tick.limit : (tick.limit * collateralValue) / this.FIXED_POINT_SCALE;
      const available = n.available;
      return { tick, limit, available };
    });
  }

  _filterNodes(nodes: DecodedLiquidityNode[], duration: number): DecodedLiquidityNode[] {
    /* Handle descending (v2) vs ascending (v1) durations */
    if (this.durations[0] > this.durations[1]) {
      /* Map duration to duration index */
      let durationIndex = [...this.durations].reverse().findIndex((d) => duration <= d);
      durationIndex = durationIndex == -1 ? -Infinity : this.durations.length - 1 - durationIndex;

      /* Filter out nodes with durations exceeding input duration */
      return nodes.filter((n) => n.tick.duration <= durationIndex);
    } else {
      /* Map duration to duration index */
      let durationIndex = this.durations.findIndex((d) => duration <= d);
      durationIndex = durationIndex == -1 ? Infinity : durationIndex;

      /* Filter out nodes with durations exceeding input duration */
      return nodes.filter((n) => n.tick.duration >= durationIndex);
    }
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
          node.limit * BigInt(multiplier) > amount &&
          TickEncoder.encode({ ...node.tick, limit: node.limit }) >
            (route.length == 0
              ? 0n
              : TickEncoder.encode({ ...route[route.length - 1].tick, limit: route[route.length - 1].limit }))
        );
      });

      /* If no nodes are available, break */
      if (availableNodes.length === 0) break;

      /* Sort nodes by cost of capital and duration */
      availableNodes.sort((a: DecodedLiquidityNode, b: DecodedLiquidityNode): number =>
        TickEncoder.encode({ ...a.tick, limit: a.limit }) <= TickEncoder.encode({ ...b.tick, limit: b.limit }) ? -1 : 1,
      );

      /* Pick best scoring node */
      const bestNode = availableNodes[0];

      /* Update cumulative amount and route */
      amount += minBigInt(bestNode.limit * BigInt(multiplier) - amount, bestNode.available);
      route.push(bestNode);
    }

    return { amount, route };
  }

  _pruneNodes(nodes: DecodedLiquidityNode[], multiplier: number, count: number): DecodedLiquidityNode[] {
    /* Source liquidity from all nodes */
    const [_, sources] = this._sourceNodes(nodes, 2n ** 120n - 1n, multiplier);

    /* Sort node indices by contribution */
    const sortedIndices = [...Array(sources.length).keys()].sort((i: number, j: number): number =>
      sources[i] > sources[j] ? -1 : sources[i] < sources[j] ? 1 : nodes[i].tick.rate < nodes[i].tick.rate ? -1 : 1,
    );

    /* Limit node indices to count and sort indices for ascending ticks */
    const limitedSortedIndices = sortedIndices
      .slice(0, count)
      .sort((i: number, j: number): number =>
        TickEncoder.encode({ ...nodes[i].tick, limit: nodes[i].limit }) <=
        TickEncoder.encode({ ...nodes[j].tick, limit: nodes[j].limit })
          ? -1
          : 1,
      );

    /* Map limited, sorted node indices back to nodes */
    return limitedSortedIndices.map((i) => nodes[i]);
  }

  _sourceNodes(nodes: DecodedLiquidityNode[], amount: bigint, multiplier: number): [bigint, bigint[]] {
    /* Source as much liquidity from nodes as possible, up to the limit, amount
     * available, and amount remaining */
    const sources: bigint[] = [];
    let taken = 0n;
    for (const node of nodes) {
      const take = minBigInt(minBigInt(node.limit * BigInt(multiplier) - taken, node.available), amount - taken);
      sources.push(take);
      taken += take;
    }

    return [taken, sources];
  }

  /****************************************************************************/
  /* Public API */
  /****************************************************************************/

  /**
   * Apply repaid node receipts to liquidity nodes (used to forecast liquidity for a refinance).
   * @param nodes Existing liquidity nodes, with additional value, shares, and
   *              pending redemptions fields
   * @param receipts Repaid node receipts
   * @param proration Proration of repayment as a fraction from 0.0 to 1.0
   * @return Repaid liquidity nodes
   */
  apply(nodes: LiquidityNode[], receipts: NodeReceipt[], proration: number): LiquidityNode[] {
    /* Transform node receipts into repaid liquidity nodes with proration applied */
    const repaid: LiquidityNode[] = receipts.map((receipt) => {
      const restored =
        receipt.used +
        ((receipt.pending - receipt.used) * BigInt(Math.floor(proration * 1e18))) / this.FIXED_POINT_SCALE;
      return { tick: receipt.tick, available: restored, value: restored, shares: 0n, redemptions: 0n };
    });

    /* Merge repaid nodes with existing nodes */
    const merged = nodes
      .concat(repaid)
      .sort((a: LiquidityNode, b: LiquidityNode) => (a.tick < b.tick ? -1 : 1))
      .reduce((acc: LiquidityNode[], n: LiquidityNode) => {
        if (acc.length > 0 && acc[acc.length - 1].tick == n.tick) {
          acc[acc.length - 1].available += n.available;
          acc[acc.length - 1].value = (acc[acc.length - 1].value ?? 0n) + (n.value ?? 0n);
          acc[acc.length - 1].shares = (acc[acc.length - 1].shares ?? 0n) + (n.shares ?? 0n);
          acc[acc.length - 1].redemptions = (acc[acc.length - 1].redemptions ?? 0n) + (n.redemptions ?? 0n);
        } else {
          if (n.value === undefined || n.shares === undefined || n.redemptions === undefined) {
            throw new Error(`Missing required fields in liquidity node with tick ${n.tick}`);
          }
          acc.push({
            tick: n.tick,
            available: n.available,
            value: n.value,
            shares: n.shares,
            redemptions: n.redemptions,
          });
        }
        return acc;
      }, []);

    /* Process redemptions in merged repaid nodes */
    return merged.map((node) => {
      if (
        node.redemptions === 0n ||
        node.available === 0n ||
        node.value === undefined ||
        node.shares === undefined ||
        node.redemptions === undefined
      ) {
        return { tick: node.tick, available: node.available };
      }

      /* Compute redemption price, redeemd shares, and redeemed amount */
      const price = (node.value * this.FIXED_POINT_SCALE) / node.shares;
      const shares =
        price === 0n
          ? node.redemptions
          : minBigInt((node.available * this.FIXED_POINT_SCALE) / price, node.redemptions);
      const amount = (shares * price) / this.FIXED_POINT_SCALE;

      return { tick: node.tick, available: node.available - amount };
    });
  }

  /**
   * Forecast liquidity available.
   * @param nodes Liquidity nodes
   * @param duration Duration in seconds
   * @param multiplier Multiplier in amount
   * @param collateralValue Collateral value for ratio ticks (optional)
   * @param numNodes Number of liquidity nodes to use (maximum)
   * @returns Liquidity available
   */
  forecast(
    nodes: LiquidityNode[],
    duration: number,
    multiplier: number = 1,
    collateralValue: bigint = 0n,
    numNodes: number = 10,
  ): bigint {
    /* Decode, filter, and traverse nodes for maximum amount along best route */
    const { route, ..._ } = this._traverseNodes(
      this._filterNodes(this._decodeNodes(nodes, collateralValue), duration),
      multiplier,
    );

    /* Limit nodes in route */
    const prunedRoute = this._pruneNodes(route, multiplier, numNodes);

    /* Source maximum liquidity from nodes */
    return this._sourceNodes(prunedRoute, 2n ** 120n - 1n, multiplier)[0];
  }

  /**
   * Route amount to liquidity nodes.
   * @param nodes Liquidity nodes
   * @param amount Total amount
   * @param duration Duration in seconds
   * @param multiplier Multiplier in amount
   * @param collateralValue Collateral value for ratio ticks (optional)
   * @param numNodes Number of liquidity nodes to use (maximum)
   * @returns Encoded ticks and sourced amounts
   */
  route(
    nodes: LiquidityNode[],
    amount: bigint,
    duration: number,
    multiplier: number = 1,
    collateralValue: bigint = 0n,
    numNodes: number = 10,
  ): [EncodedTick[], bigint[]] {
    /* Decode, filter, and traverse nodes for maximum amount along best route */
    const { route, ..._ } = this._traverseNodes(
      this._filterNodes(this._decodeNodes(nodes, collateralValue), duration),
      multiplier,
    );

    /* Limit nodes in route */
    const prunedRoute = this._pruneNodes(route, multiplier, numNodes);

    /* Source liquidity from nodes */
    const [total, sources] = this._sourceNodes(prunedRoute, amount, multiplier);

    /* Check sufficient liquidity is available in pruned route */
    if (total != amount) {
      throw new Error(`Insufficient liquidity for ${amount} amount.`);
    }

    return [prunedRoute.map((n) => TickEncoder.encode(n.tick)), sources];
  }

  /**
   * Quote repayment for amount.
   * @param nodes Liquidity nodes
   * @param ticks Ticks to use
   * @param amount Total amount
   * @param duration Duration in seconds
   * @param multiplier Multiplier in amount
   * @param collateralValue Collateral value for ratio ticks (optional)
   * @returns Repayment amount
   */
  quote(
    nodes: LiquidityNode[],
    ticks: EncodedTick[],
    amount: bigint,
    duration: number,
    multiplier: number = 1,
    collateralValue: bigint = 0n,
  ): bigint {
    /* Handle zero case */
    if (amount == 0n) return 0n;

    /* Reconstruct route from selected ticks */
    const route = this._decodeNodes(
      ticks.map((tick) => nodes.find((n) => n.tick === tick)).filter((n): n is LiquidityNode => !!n),
      collateralValue,
    );

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
