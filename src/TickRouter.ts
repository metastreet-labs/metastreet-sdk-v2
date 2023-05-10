import { EncodedTick, DecodedTick, TickEncoder } from './Tick';

export interface LiquidityNode {
  tick: EncodedTick;
  available: bigint;
}

interface DecodedLiquidityNode {
  tick: DecodedTick;
  available: bigint;
}

interface Route {
  nodes: DecodedLiquidityNode[];
  amount: bigint;
  cost: bigint;
}

function minBigInt(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

export class TickRouter {
  readonly durations: number[];
  readonly rates: bigint[];

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

    /* Filter nodes with durations exceeding input duration */
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
    nodes: DecodedLiquidityNode[] = [],
    amount: bigint = 0n,
    cost: bigint = 0n,
  ): Route[] {
    /* If we reached the end of the nodes */
    if (aggregatedNodes.length == 0) {
      return [];
    }

    let routes: Route[] = [];
    for (const node of aggregatedNodes[0]) {
      /* Source liquidity from this node and calculate its cost */
      const nodeAmount = minBigInt(node.tick.limit * BigInt(multiplier) - amount, node.available);
      const nodeCost = nodeAmount * BigInt(node.tick.rate + 1);

      if (nodeAmount == 0n) {
        /* If node amount is 0, skip the node */
        routes = routes.concat(this._traverseNodes(aggregatedNodes.slice(1), multiplier, nodes, amount, cost));
      } else {
        /* Add the route that ends here and all routes that continue downstream */
        routes = routes.concat(
          { nodes: [...nodes, node], amount: amount + nodeAmount, cost: cost + nodeCost },
          this._traverseNodes(
            aggregatedNodes.slice(1),
            multiplier,
            [...nodes, node],
            amount + nodeAmount,
            cost + nodeCost,
          ),
        );
      }
    }

    return routes;
  }

  _findBestRoute(routes: Route[]): Route {
    /* Find route with greatest amount, followed by lowest cost, followed by lowest amount of nodes */
    return routes.reduce(
      (bestRoute, route) =>
        route.amount > bestRoute.amount || (route.amount == bestRoute.amount && route.cost < bestRoute.cost)
          ? route
          : bestRoute,
      routes.length == 0 ? { nodes: [], amount: 0n, cost: 0n } : routes[0],
    );
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
    /* Discover all routes */
    const routes = this._traverseNodes(
      this._aggregateNodes(this._filterNodes(this._decodeNodes(nodes), duration)),
      multiplier,
    );

    /* Find best route */
    const route = this._findBestRoute(routes);

    /* Take top number of nodes on route */
    const topNodes = route.nodes.splice(-numNodes);

    /* Source maximum liquidity from nodes */
    return this._sourceNodes(topNodes, 2n ** 120n - 1n, multiplier);
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
    /* Discover all routes */
    const routes = this._traverseNodes(
      this._aggregateNodes(this._filterNodes(this._decodeNodes(nodes), duration)),
      multiplier,
    );

    /* Find best route */
    const route = this._findBestRoute(routes);

    /* Take top number of nodes on route */
    const topNodes = route.nodes.splice(-numNodes);

    /* Check sufficient liquidity is available in nodes */
    if (this._sourceNodes(topNodes, amount, multiplier) != amount) {
      throw new Error(`Insufficient liquidity for ${amount} amount.`);
    }

    return topNodes.map((n) => TickEncoder.encode(n.tick));
  }
}
