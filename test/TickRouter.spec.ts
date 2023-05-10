import { TickRouter, LiquidityNode } from '../src';
import { TickEncoder } from '../src';

const TEST_NODES: LiquidityNode[] = [
  { tick: TickEncoder.encode({ limit: 0n, duration: 0, rate: 0 }), available: 0n },
  { tick: TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }), available: 500n },
  { tick: TickEncoder.encode({ limit: 50n, duration: 0, rate: 2 }), available: 0n },
  { tick: TickEncoder.encode({ limit: 50n, duration: 1, rate: 0 }), available: 250n },
  { tick: TickEncoder.encode({ limit: 50n, duration: 2, rate: 1 }), available: 200n },
  { tick: TickEncoder.encode({ limit: 100n, duration: 0, rate: 1 }), available: 150n },
  { tick: TickEncoder.encode({ limit: 100n, duration: 1, rate: 2 }), available: 100n },
];

describe('TickRouter', function () {
  let router: TickRouter;

  beforeEach(function () {
    router = new TickRouter([7 * 86400, 14 * 86400, 30 * 86400], [3170979198n, 9512937595n, 15854895991n]);
  });

  it('#_decodeNodes', function () {
    expect(router._decodeNodes(TEST_NODES)).toEqual([
      { tick: { limit: 0n, duration: 0, rate: 0, reserved: 0n }, available: 0n },
      { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
      { tick: { limit: 50n, duration: 0, rate: 2, reserved: 0n }, available: 0n },
      { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
      { tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n },
      { tick: { limit: 100n, duration: 0, rate: 1, reserved: 0n }, available: 150n },
      { tick: { limit: 100n, duration: 1, rate: 2, reserved: 0n }, available: 100n },
    ]);
  });

  it('#_filterNodes', function () {
    const nodes = router._decodeNodes(TEST_NODES);

    /* 3 days */
    expect(router._filterNodes(nodes, 3 * 86400)).toEqual([
      { tick: { limit: 0n, duration: 0, rate: 0, reserved: 0n }, available: 0n },
      { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
      { tick: { limit: 50n, duration: 0, rate: 2, reserved: 0n }, available: 0n },
      { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
      { tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n },
      { tick: { limit: 100n, duration: 0, rate: 1, reserved: 0n }, available: 150n },
      { tick: { limit: 100n, duration: 1, rate: 2, reserved: 0n }, available: 100n },
    ]);

    /* 10 days */
    expect(router._filterNodes(nodes, 10 * 86400)).toEqual([
      { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
      { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
      { tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n },
      { tick: { limit: 100n, duration: 1, rate: 2, reserved: 0n }, available: 100n },
    ]);

    /* 30 days */
    expect(router._filterNodes(nodes, 30 * 86400)).toEqual([
      { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
      { tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n },
    ]);

    /* 35 days */
    expect(router._filterNodes(nodes, 35 * 86400)).toEqual([]);
  });

  it('#_aggregateNodes', function () {
    const nodes = router._decodeNodes(TEST_NODES);

    /* 3 days */
    expect(router._aggregateNodes(router._filterNodes(nodes, 3 * 86400))).toEqual([
      [{ tick: { limit: 0n, duration: 0, rate: 0, reserved: 0n }, available: 0n }],
      [{ tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n }],
      [
        { tick: { limit: 50n, duration: 0, rate: 2, reserved: 0n }, available: 0n },
        { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
        { tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n },
      ],
      [
        { tick: { limit: 100n, duration: 0, rate: 1, reserved: 0n }, available: 150n },
        { tick: { limit: 100n, duration: 1, rate: 2, reserved: 0n }, available: 100n },
      ],
    ]);

    /* 10 days */
    expect(router._aggregateNodes(router._filterNodes(nodes, 10 * 86400))).toEqual([
      [{ tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n }],
      [
        { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
        { tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n },
      ],
      [{ tick: { limit: 100n, duration: 1, rate: 2, reserved: 0n }, available: 100n }],
    ]);

    /* 30 days */
    expect(router._aggregateNodes(router._filterNodes(nodes, 30 * 86400))).toEqual([
      [{ tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n }],
      [{ tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n }],
    ]);

    /* 35 days */
    expect(router._aggregateNodes(router._filterNodes(nodes, 35 * 86400))).toEqual([]);
  });

  it('#_traverseNodes', function () {
    const nodes = router._decodeNodes(TEST_NODES);

    /* 10 days */
    expect(router._traverseNodes(router._aggregateNodes(router._filterNodes(nodes, 10 * 86400)), 1)).toEqual([
      {
        nodes: [{ tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n }],
        amount: 25n,
        cost: 25n,
      },
      {
        nodes: [
          { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
          { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
        ],
        amount: 50n,
        cost: 50n,
      },
      {
        nodes: [
          { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
          { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
          { tick: { limit: 100n, duration: 1, rate: 2, reserved: 0n }, available: 100n },
        ],
        amount: 100n,
        cost: 200n,
      },
      {
        nodes: [
          { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
          { tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n },
        ],
        amount: 50n,
        cost: 75n,
      },
      {
        nodes: [
          { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
          { tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n },
          { tick: { limit: 100n, duration: 1, rate: 2, reserved: 0n }, available: 100n },
        ],
        amount: 100n,
        cost: 225n,
      },
    ]);
    expect(router._traverseNodes(router._aggregateNodes(router._filterNodes(nodes, 10 * 86400)), 3)).toEqual([
      {
        nodes: [{ tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n }],
        amount: 75n,
        cost: 75n,
      },
      {
        nodes: [
          { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
          { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
        ],
        amount: 150n,
        cost: 150n,
      },
      {
        nodes: [
          { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
          { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
          { tick: { limit: 100n, duration: 1, rate: 2, reserved: 0n }, available: 100n },
        ],
        amount: 250n,
        cost: 450n,
      },
      {
        nodes: [
          { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
          { tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n },
        ],
        amount: 150n,
        cost: 225n,
      },
      {
        nodes: [
          { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
          { tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n },
          { tick: { limit: 100n, duration: 1, rate: 2, reserved: 0n }, available: 100n },
        ],
        amount: 250n,
        cost: 525n,
      },
    ]);

    /* 30 days */
    expect(router._traverseNodes(router._aggregateNodes(router._filterNodes(nodes, 30 * 86400)), 1)).toEqual([
      {
        nodes: [{ tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n }],
        amount: 25n,
        cost: 25n,
      },
      {
        nodes: [
          { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
          { tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n },
        ],
        amount: 50n,
        cost: 75n,
      },
    ]);
    expect(router._traverseNodes(router._aggregateNodes(router._filterNodes(nodes, 30 * 86400)), 3)).toEqual([
      {
        nodes: [{ tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n }],
        amount: 75n,
        cost: 75n,
      },
      {
        nodes: [
          { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
          { tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n },
        ],
        amount: 150n,
        cost: 225n,
      },
    ]);

    /* 35 days */
    expect(router._traverseNodes(router._aggregateNodes(router._filterNodes(nodes, 35 * 86400)), 1)).toEqual([]);
    expect(router._traverseNodes(router._aggregateNodes(router._filterNodes(nodes, 35 * 86400)), 3)).toEqual([]);
  });

  it('#_findBestRoute', function () {
    const nodes = router._decodeNodes(TEST_NODES);

    /* 10 days */
    expect(
      router._findBestRoute(router._traverseNodes(router._aggregateNodes(router._filterNodes(nodes, 10 * 86400)), 1)),
    ).toEqual({
      nodes: [
        { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
        { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
        { tick: { limit: 100n, duration: 1, rate: 2, reserved: 0n }, available: 100n },
      ],
      amount: 100n,
      cost: 200n,
    });
    expect(
      router._findBestRoute(router._traverseNodes(router._aggregateNodes(router._filterNodes(nodes, 10 * 86400)), 3)),
    ).toEqual({
      nodes: [
        { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
        { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
        { tick: { limit: 100n, duration: 1, rate: 2, reserved: 0n }, available: 100n },
      ],
      amount: 250n,
      cost: 450n,
    });

    /* 30 days */
    expect(
      router._findBestRoute(router._traverseNodes(router._aggregateNodes(router._filterNodes(nodes, 30 * 86400)), 1)),
    ).toEqual({
      nodes: [
        { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
        { tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n },
      ],
      amount: 50n,
      cost: 75n,
    });
    expect(
      router._findBestRoute(router._traverseNodes(router._aggregateNodes(router._filterNodes(nodes, 30 * 86400)), 3)),
    ).toEqual({
      nodes: [
        { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
        { tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n },
      ],
      amount: 150n,
      cost: 225n,
    });

    /* 35 days */
    expect(
      router._findBestRoute(router._traverseNodes(router._aggregateNodes(router._filterNodes(nodes, 35 * 86400)), 1)),
    ).toEqual({
      nodes: [],
      amount: 0n,
      cost: 0n,
    });
    expect(
      router._findBestRoute(router._traverseNodes(router._aggregateNodes(router._filterNodes(nodes, 35 * 86400)), 3)),
    ).toEqual({
      nodes: [],
      amount: 0n,
      cost: 0n,
    });
  });

  it('#forecast', function () {
    /* 3 days */
    expect(router.forecast(TEST_NODES, 3 * 86400, 1)).toEqual(100n);
    expect(router.forecast(TEST_NODES, 3 * 86400, 3)).toEqual(300n);

    /* 10 days */
    expect(router.forecast(TEST_NODES, 10 * 86400, 1)).toEqual(100n);
    expect(router.forecast(TEST_NODES, 10 * 86400, 3)).toEqual(250n);

    /* 30 days */
    expect(router.forecast(TEST_NODES, 30 * 86400, 1)).toEqual(50n);
    expect(router.forecast(TEST_NODES, 30 * 86400, 3)).toEqual(150n);

    /* 35 days */
    expect(router.forecast(TEST_NODES, 35 * 86400, 1)).toEqual(0n);
    expect(router.forecast(TEST_NODES, 35 * 86400, 3)).toEqual(0n);

    /* 10 days with reduced number of nodes */
    expect(router.forecast(TEST_NODES, 10 * 86400, 3, 1)).toEqual(100n);
  });

  it('#route', function () {
    /* 3 days */
    expect(router.route(TEST_NODES, 100n, 3 * 86400, 1)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 1, rate: 0 }),
      TickEncoder.encode({ limit: 100n, duration: 0, rate: 1 }),
    ]);
    expect(router.route(TEST_NODES, 300n, 3 * 86400, 3)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 1, rate: 0 }),
      TickEncoder.encode({ limit: 100n, duration: 0, rate: 1 }),
    ]);

    /* 10 days */
    expect(router.route(TEST_NODES, 100n, 10 * 86400, 1)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 1, rate: 0 }),
      TickEncoder.encode({ limit: 100n, duration: 1, rate: 2 }),
    ]);
    expect(router.route(TEST_NODES, 250n, 10 * 86400, 3)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 1, rate: 0 }),
      TickEncoder.encode({ limit: 100n, duration: 1, rate: 2 }),
    ]);

    /* 30 days */
    expect(router.route(TEST_NODES, 50n, 30 * 86400, 1)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 2, rate: 1 }),
    ]);
    expect(router.route(TEST_NODES, 100n, 30 * 86400, 3)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 2, rate: 1 }),
    ]);

    /* 30 days over available */
    expect(() => router.route(TEST_NODES, 51n, 30 * 86400, 1)).toThrow();

    /* 10 days with reduced number of nodes */
    expect(router.route(TEST_NODES, 100n, 10 * 86400, 3, 1)).toEqual([
      TickEncoder.encode({ limit: 100n, duration: 1, rate: 2 }),
    ]);

    /* 35 days */
    expect(router.route(TEST_NODES, 0n, 35 * 86400, 1)).toEqual([]);
    expect(() => router.route(TEST_NODES, 1n, 35 * 86400, 1)).toThrow();
  });
});
