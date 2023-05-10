import { EncodedTick, Index, DecodedTick, TickEncoder } from './Tick';

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
  readonly rates: number[];

  /****************************************************************************/
  /* Constructor */
  /****************************************************************************/

  constructor(durations: number[], rates: number[]) {
    this.durations = durations;
    this.rates = rates;
  }

  /****************************************************************************/
  /* Internal Helpers */
  /****************************************************************************/

  _mapDuration(duration: number): Index {
    /* Find lowest matching duration */
    for (let i = 0; i < this.durations.length; i++) {
      if (duration <= this.durations[i]) return i;
    }

    throw new Error(`Unsupported duration ${duration} (max is ${this.durations[this.durations.length - 1]}).`);
  }

  _filterNodes(nodes: LiquidityNode[], duration: number): DecodedLiquidityNode[] {
    /* Decode liquidity nodes */
    let decodedNodes = nodes.map((n) => ({ tick: TickEncoder.decode(n.tick), available: n.available }));

    /* Map duration index */
    const durationIndex = this._mapDuration(duration);

    /* Filter liquidity nodes by supported duration */
    decodedNodes = decodedNodes.filter((n) => n.tick.duration >= durationIndex);

    /* Sort liquidity nodes by rate */
    decodedNodes.sort((a, b) => (a.tick.limit <= b.tick.limit && a.tick.rate < b.tick.rate ? -1 : 1));

    /* Filter liquidity nodes by lowest rate */
    decodedNodes = decodedNodes.reduce(
      (acc, n) => (acc.length == 0 || acc[acc.length - 1].tick.limit != n.tick.limit ? [...acc, n] : acc),
      [] as DecodedLiquidityNode[],
    );

    /* FIXME this will ultimately filter by lowest effective rate, taking
     * amount available into account */

    return decodedNodes;
  }

  _sourceNodes(nodes: DecodedLiquidityNode[], amount: bigint, multiplier: number): bigint {
    /* Source as much liquidity from nodes as possible, up to the limit, amount
     * available, and amount remaining */
    let taken = 0n;
    for (const node of nodes) {
      taken += minBigInt(minBigInt(node.tick.limit * BigInt(multiplier) - taken, node.available), amount - taken);
    }

    return taken;
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
    const filteredNodes = this._filterNodes(nodes, duration).splice(-numNodes);

    const amount = this._sourceNodes(filteredNodes, 2n ** 128n - 1n, multiplier);

    return amount;
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
    const filteredNodes = this._filterNodes(nodes, duration).splice(-numNodes);

    const available = this._sourceNodes(filteredNodes, amount, multiplier);
    if (available != amount) {
      throw new Error(`Insufficient liquidity for ${amount} amount.`);
    }

    return filteredNodes.map((n) => TickEncoder.encode(n.tick));
  }
}
