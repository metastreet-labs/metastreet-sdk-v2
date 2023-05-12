import { TickRouter, LiquidityNode } from '../src';
import { TickEncoder } from '../src';

const TEST_NODES_1: LiquidityNode[] = [
  { tick: TickEncoder.encode({ limit: 0n, duration: 0, rate: 0 }), available: 0n },
  { tick: TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }), available: 500n },
  { tick: TickEncoder.encode({ limit: 50n, duration: 0, rate: 2 }), available: 0n },
  { tick: TickEncoder.encode({ limit: 50n, duration: 1, rate: 0 }), available: 250n },
  { tick: TickEncoder.encode({ limit: 50n, duration: 2, rate: 1 }), available: 200n },
  { tick: TickEncoder.encode({ limit: 100n, duration: 0, rate: 1 }), available: 150n },
  { tick: TickEncoder.encode({ limit: 100n, duration: 1, rate: 2 }), available: 100n },
];

const TEST_NODES_2: LiquidityNode[] = [
  { tick: TickEncoder.encode({ limit: 0n, duration: 0, rate: 0 }), available: 0n },
  { tick: TickEncoder.encode({ limit: 5n, duration: 0, rate: 0 }), available: 5n },
  { tick: TickEncoder.encode({ limit: 10n, duration: 0, rate: 0 }), available: 1n },
  { tick: TickEncoder.encode({ limit: 10n, duration: 0, rate: 1 }), available: 4n },
  { tick: TickEncoder.encode({ limit: 15n, duration: 0, rate: 2 }), available: 10n },
  { tick: TickEncoder.encode({ limit: 20n, duration: 0, rate: 1 }), available: 4n },
  { tick: TickEncoder.encode({ limit: 20n, duration: 0, rate: 2 }), available: 1n },
  { tick: TickEncoder.encode({ limit: 25n, duration: 0, rate: 0 }), available: 5n },
  { tick: TickEncoder.encode({ limit: 25n, duration: 0, rate: 1 }), available: 12n },
];

const TEST_NODES_3: LiquidityNode[] = [
  { tick: TickEncoder.encode({ limit: 0n, duration: 0, rate: 0 }), available: 0n },
  { tick: TickEncoder.encode({ limit: 50n, duration: 0, rate: 0 }), available: 1000n },
  { tick: TickEncoder.encode({ limit: 100n, duration: 0, rate: 0 }), available: 500n },
  { tick: TickEncoder.encode({ limit: 150n, duration: 0, rate: 1 }), available: 250n },
  { tick: TickEncoder.encode({ limit: 200n, duration: 0, rate: 2 }), available: 100n },
];

const TEST_NODES_4: LiquidityNode[] = [
  { tick: TickEncoder.encode({ limit: 0n, duration: 0, rate: 0 }), available: 0n },
  { tick: TickEncoder.encode({ limit: 50n, duration: 0, rate: 0 }), available: 100n },
  { tick: TickEncoder.encode({ limit: 100n, duration: 0, rate: 0 }), available: 1n },
  { tick: TickEncoder.encode({ limit: 150n, duration: 0, rate: 1 }), available: 1n },
  { tick: TickEncoder.encode({ limit: 200n, duration: 0, rate: 2 }), available: 100n },
  { tick: TickEncoder.encode({ limit: 250n, duration: 0, rate: 1 }), available: 1n },
  { tick: TickEncoder.encode({ limit: 300n, duration: 0, rate: 2 }), available: 100n },
  { tick: TickEncoder.encode({ limit: 350n, duration: 0, rate: 2 }), available: 1n },
  { tick: TickEncoder.encode({ limit: 400n, duration: 0, rate: 2 }), available: 100n },
];

describe('TickRouter', function () {
  let router: TickRouter;

  beforeEach(function () {
    router = new TickRouter([7 * 86400, 14 * 86400, 30 * 86400], [3170979198n, 9512937595n, 15854895991n]);
  });

  it('#_decodeNodes', function () {
    expect(router._decodeNodes(TEST_NODES_1)).toEqual([
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
    const nodes = router._decodeNodes(TEST_NODES_1);

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
    expect(router._aggregateNodes(router._decodeNodes(TEST_NODES_1))).toEqual([
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
  });

  it('#_traverseNodes', function () {
    expect(router._traverseNodes(router._aggregateNodes(router._decodeNodes(TEST_NODES_1)), 1)).toEqual({
      amount: 100n,
      route: [
        { tick: { limit: 0n, duration: 0, rate: 0, reserved: 0n }, available: 0n },
        { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
        { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
        { tick: { limit: 100n, duration: 0, rate: 1, reserved: 0n }, available: 150n },
      ],
    });

    expect(router._traverseNodes(router._aggregateNodes(router._decodeNodes(TEST_NODES_1)), 3)).toEqual({
      amount: 300n,
      route: [
        { tick: { limit: 0n, duration: 0, rate: 0, reserved: 0n }, available: 0n },
        { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
        { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
        { tick: { limit: 100n, duration: 0, rate: 1, reserved: 0n }, available: 150n },
      ],
    });

    expect(router._traverseNodes(router._aggregateNodes(router._decodeNodes(TEST_NODES_2)), 1)).toEqual({
      amount: 25n,
      route: [
        { tick: { limit: 0n, duration: 0, rate: 0, reserved: 0n }, available: 0n },
        { tick: { limit: 5n, duration: 0, rate: 0, reserved: 0n }, available: 5n },
        { tick: { limit: 10n, duration: 0, rate: 1, reserved: 0n }, available: 4n },
        { tick: { limit: 15n, duration: 0, rate: 2, reserved: 0n }, available: 10n },
        { tick: { limit: 20n, duration: 0, rate: 1, reserved: 0n }, available: 4n },
        { tick: { limit: 25n, duration: 0, rate: 1, reserved: 0n }, available: 12n },
      ],
    });
  });

  it('#_sourceNodes', function () {
    expect(router._sourceNodes(router._decodeNodes(TEST_NODES_3), 999999n, 1)).toEqual(200n);
    expect(router._sourceNodes(router._decodeNodes(TEST_NODES_3), 100n, 1)).toEqual(100n);
    expect(router._sourceNodes(router._decodeNodes(TEST_NODES_3), 50n, 1)).toEqual(50n);

    expect(router._sourceNodes(router._decodeNodes(TEST_NODES_3), 999999n, 3)).toEqual(550n);
    expect(router._sourceNodes(router._decodeNodes(TEST_NODES_3), 300n, 3)).toEqual(300n);
    expect(router._sourceNodes(router._decodeNodes(TEST_NODES_3), 50n, 3)).toEqual(50n);
  });

  it('#_pruneNodes', function () {
    expect(router._sourceNodes(router._decodeNodes(TEST_NODES_4), 999999n, 1)).toEqual(354n);

    expect(router._pruneNodes(router._decodeNodes(TEST_NODES_4), 354n)).toEqual([
      { tick: { limit: 50n, duration: 0, rate: 0, reserved: 0n }, available: 100n },
      { tick: { limit: 200n, duration: 0, rate: 2, reserved: 0n }, available: 100n },
      { tick: { limit: 300n, duration: 0, rate: 2, reserved: 0n }, available: 100n },
      { tick: { limit: 400n, duration: 0, rate: 2, reserved: 0n }, available: 100n },
    ]);
  });

  it('#_limitNodes', function () {
    expect(router._limitNodes(router._decodeNodes(TEST_NODES_1), 4)).toEqual([
      { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
      { tick: { limit: 50n, duration: 2, rate: 1, reserved: 0n }, available: 200n },
      { tick: { limit: 100n, duration: 0, rate: 1, reserved: 0n }, available: 150n },
      { tick: { limit: 100n, duration: 1, rate: 2, reserved: 0n }, available: 100n },
    ]);
  });

  it('#forecast', function () {
    /* 3 days */
    expect(router.forecast(TEST_NODES_1, 3 * 86400, 1)).toEqual(100n);
    expect(router.forecast(TEST_NODES_1, 3 * 86400, 3)).toEqual(300n);

    /* 10 days */
    expect(router.forecast(TEST_NODES_1, 10 * 86400, 1)).toEqual(100n);
    expect(router.forecast(TEST_NODES_1, 10 * 86400, 3)).toEqual(250n);

    /* 30 days */
    expect(router.forecast(TEST_NODES_1, 30 * 86400, 1)).toEqual(50n);
    expect(router.forecast(TEST_NODES_1, 30 * 86400, 3)).toEqual(150n);

    /* 35 days */
    expect(router.forecast(TEST_NODES_1, 35 * 86400, 1)).toEqual(0n);
    expect(router.forecast(TEST_NODES_1, 35 * 86400, 3)).toEqual(0n);

    /* Nodes with dust */
    expect(router.forecast(TEST_NODES_4, 3 * 86400, 1)).toEqual(350n);
    expect(router.forecast(TEST_NODES_4, 3 * 86400, 3)).toEqual(400n);

    /* Nodes with dust, with reduced number of nodes */
    expect(router.forecast(TEST_NODES_4, 3 * 86400, 1, 3)).toEqual(300n);
    expect(router.forecast(TEST_NODES_4, 3 * 86400, 3, 3)).toEqual(300n);
  });

  it('#route', function () {
    /* 3 days */
    expect(router.route(TEST_NODES_1, 100n, 3 * 86400, 1)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 1, rate: 0 }),
      TickEncoder.encode({ limit: 100n, duration: 0, rate: 1 }),
    ]);
    expect(router.route(TEST_NODES_1, 300n, 3 * 86400, 3)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 1, rate: 0 }),
      TickEncoder.encode({ limit: 100n, duration: 0, rate: 1 }),
    ]);

    /* 10 days */
    expect(router.route(TEST_NODES_1, 100n, 10 * 86400, 1)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 1, rate: 0 }),
      TickEncoder.encode({ limit: 100n, duration: 1, rate: 2 }),
    ]);
    expect(router.route(TEST_NODES_1, 250n, 10 * 86400, 3)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 1, rate: 0 }),
      TickEncoder.encode({ limit: 100n, duration: 1, rate: 2 }),
    ]);

    /* 30 days */
    expect(router.route(TEST_NODES_1, 50n, 30 * 86400, 1)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 2, rate: 1 }),
    ]);
    expect(router.route(TEST_NODES_1, 100n, 30 * 86400, 3)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 2, rate: 1 }),
    ]);

    /* 30 days, over available */
    expect(() => router.route(TEST_NODES_1, 51n, 30 * 86400, 1)).toThrow();

    /* 35 days */
    expect(router.route(TEST_NODES_1, 0n, 35 * 86400, 1)).toEqual([]);
    expect(() => router.route(TEST_NODES_1, 1n, 35 * 86400, 1)).toThrow();

    /* Nodes with dust */
    expect(router.route(TEST_NODES_4, 350n, 3 * 86400, 1)).toEqual([
      TickEncoder.encode({ limit: 50n, duration: 0, rate: 0 }),
      TickEncoder.encode({ limit: 200n, duration: 0, rate: 2 }),
      TickEncoder.encode({ limit: 300n, duration: 0, rate: 2 }),
      TickEncoder.encode({ limit: 400n, duration: 0, rate: 2 }),
    ]);
    expect(router.route(TEST_NODES_4, 400n, 3 * 86400, 3)).toEqual([
      TickEncoder.encode({ limit: 50n, duration: 0, rate: 0 }),
      TickEncoder.encode({ limit: 200n, duration: 0, rate: 2 }),
      TickEncoder.encode({ limit: 300n, duration: 0, rate: 2 }),
      TickEncoder.encode({ limit: 400n, duration: 0, rate: 2 }),
    ]);

    /* Nodes with dust, with reduced number of nodes */
    expect(router.route(TEST_NODES_4, 300n, 3 * 86400, 1, 3)).toEqual([
      TickEncoder.encode({ limit: 200n, duration: 0, rate: 2 }),
      TickEncoder.encode({ limit: 300n, duration: 0, rate: 2 }),
      TickEncoder.encode({ limit: 400n, duration: 0, rate: 2 }),
    ]);
  });
});
