import { TickRouter, LiquidityNode, NodeReceipt } from '../src';
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

const TEST_NODES_5: LiquidityNode[] = [
  { tick: TickEncoder.encode({ limit: 0n, duration: 0, rate: 0 }), available: 0n },
  { tick: TickEncoder.encode({ limit: 50n * 10n ** 18n, duration: 0, rate: 0 }), available: 1000n * 10n ** 18n },
  { tick: TickEncoder.encode({ limit: 100n * 10n ** 18n, duration: 0, rate: 0 }), available: 500n * 10n ** 18n },
  { tick: TickEncoder.encode({ limit: 150n * 10n ** 18n, duration: 0, rate: 1 }), available: 250n * 10n ** 18n },
  { tick: TickEncoder.encode({ limit: 200n * 10n ** 18n, duration: 0, rate: 2 }), available: 100n * 10n ** 18n },
];

const TEST_NODES_6: LiquidityNode[] = [
  {
    tick: TickEncoder.encode({ limit: 50n * 10n ** 18n, duration: 0, rate: 0 }),
    available: 50n * 10n ** 18n,
    value: 100n * 10n ** 18n,
    shares: 100n * 10n ** 18n,
    redemptions: 0n,
  },
  {
    tick: TickEncoder.encode({ limit: 100n * 10n ** 18n, duration: 0, rate: 0 }),
    available: 0n * 10n ** 18n,
    value: 40n * 10n ** 18n,
    shares: 40n * 10n ** 18n,
    redemptions: 25n * 10n ** 18n,
  },
  {
    tick: TickEncoder.encode({ limit: 150n * 10n ** 18n, duration: 0, rate: 1 }),
    available: 25n * 10n ** 18n,
    value: 30n * 10n ** 18n,
    shares: 100n * 10n ** 18n,
    redemptions: 20n * 10n ** 18n,
  },
];

const TEST_NODE_RECEIPTS_1: NodeReceipt[] = [
  {
    tick: TickEncoder.encode({ limit: 50n * 10n ** 18n, duration: 0, rate: 0 }),
    used: 50n * 10n ** 18n,
    pending: 60n * 10n ** 18n,
  },
  {
    tick: TickEncoder.encode({ limit: 100n * 10n ** 18n, duration: 0, rate: 0 }),
    used: 5n * 10n ** 18n,
    pending: 10n * 10n ** 18n,
  },
  {
    tick: TickEncoder.encode({ limit: 125n * 10n ** 18n, duration: 0, rate: 0 }),
    used: 5n * 10n ** 18n,
    pending: 10n * 10n ** 18n,
  },
  {
    tick: TickEncoder.encode({ limit: 150n * 10n ** 18n, duration: 0, rate: 1 }),
    used: 10n * 10n ** 18n,
    pending: 20n * 10n ** 18n,
  },
  {
    tick: TickEncoder.encode({ limit: 200n * 10n ** 18n, duration: 0, rate: 1 }),
    used: 5n * 10n ** 18n,
    pending: 15n * 10n ** 18n,
  },
];

describe('TickRouter', function () {
  let router: TickRouter;

  beforeEach(function () {
    router = new TickRouter([7 * 86400, 14 * 86400, 30 * 86400], [3170979198n, 9512937595n, 15854895991n]);
  });

  it.skip('#debug1', function () {
    router = new TickRouter([3 * 86400, 7 * 86400, 30 * 86400], [3170979198n, 9512937595n, 15854895991n]);
    const nodes = [
      { tick: 9007999999999997440064n, available: 40000000000000000000n },
      { tick: 11264000000000000000064n, available: 370000000000000000n },
      { tick: 11264000000000000000068n, available: 20000000000000000n },
    ];
    console.log(router.forecast(nodes, 30 * 86400, 1, 1)); // should be 35 ETH, but is 0.37 ETH
    console.log(router.forecast(nodes, 30 * 86400, 1, 2));
  });

  it.skip('#debug2', function () {
    const nodes = [
      { tick: 256000000000000000064n, available: 1n },
      { tick: 256000000000000000068n, available: 0n },
      { tick: 256000000000000000072n, available: 18150882385417563712n },
      { tick: 512000000000000000040n, available: 14002205403856062614n },
      { tick: 826384294705525683240n, available: 9568663437757083053n },
      { tick: 1026384294705526016008n, available: 7656249999999997089n },
      { tick: 1026384294705526016040n, available: 1n },
      { tick: 1231991899848122112040n, available: 1n },
      { tick: 1231991899848122112068n, available: 1000n },
      { tick: 1355191089832934323208n, available: 1n },
      { tick: 1512727272727272448036n, available: 1n },
      { tick: 1664000000000000000036n, available: 6n },
      { tick: 1920000000000000000032n, available: 1000n },
      { tick: 1920000000000000000068n, available: 1000n },
    ];
    router = new TickRouter([3 * 86400, 7 * 86400, 30 * 86400], [3170979198n, 9512937595n, 15854895991n]);

    console.log(router.route(nodes, 4009313651193461000n, 3 * 86400, 1, 10));
  });

  it.skip('#debug3', function () {
    const nodes = [
      { tick: 256000000000000000064n, available: 1n },
      { tick: 256000000000000000072n, available: 30169685891819532120n },
      { tick: 512000000000000000040n, available: 42109442849933825652n },
      { tick: 826384294705525683240n, available: 40805143757637168706n },
      { tick: 1026384294705526016008n, available: 3820474313814731091n },
      { tick: 1026384294705526016040n, available: 33813858744264434151n },
      { tick: 1231991899848122112040n, available: 42328483240909313597n },
      { tick: 1231991899848122112068n, available: 120728038297924509n },
      { tick: 1355191089832934323208n, available: 24726298942886664375n },
      { tick: 1512727272727272448008n, available: 1000n },
      { tick: 1512727272727272448036n, available: 1n },
      { tick: 1664000000000000000036n, available: 6n },
      { tick: 1920000000000000000032n, available: 1198n },
      { tick: 1920000000000000000068n, available: 1n },
    ];
    router = new TickRouter([259200, 604800, 2592000], [3170979198n, 9512937595n, 15854895991n]);
    console.log(router._decodeNodes(nodes));

    console.log(router.route(nodes, 5293715194659900707n, 3 * 86400, 1, 11));
  });

  it.skip('#debug4', function () {
    const nodes = [
      { tick: 256000000000000000064n, available: 1n },
      { tick: 256000000000000000072n, available: 29169685891819532120n },
      { tick: 512000000000000000040n, available: 41109442849933825652n },
      { tick: 826384294705525683240n, available: 39577080106443709006n },
      { tick: 1026384294705526016008n, available: 3039224313814729791n },
      { tick: 1026384294705526016040n, available: 33813858744264434151n },
      { tick: 1231991899848122112040n, available: 41525328533321047597n },
      { tick: 1231991899848122112068n, available: 120728038297924509n },
      { tick: 1355191089832934323208n, available: 24245052107008492675n },
      { tick: 1512727272727272448008n, available: 1000n },
      { tick: 1512727272727272448036n, available: 1n },
      { tick: 1664000000000000000036n, available: 6n },
      { tick: 1920000000000000000032n, available: 1198n },
      { tick: 1920000000000000000068n, available: 1n },
    ];
    router = new TickRouter([259200, 604800, 2592000], [3170979198n, 9512937595n, 15854895991n]);

    const x = router.forecast(nodes, 3 * 86400, 1, 7);
    console.log(router.route(nodes, x, 3 * 86400, 1, 7));
  });

  it.skip('#debug5', function () {
    const nodes = [
      { tick: 256000000000000000064n, available: 1n },
      { tick: 256000000000000000072n, available: 29169685891819532120n },
      { tick: 512000000000000000040n, available: 41109442849933825652n },
      { tick: 826384294705525683240n, available: 39577080106443709006n },
      { tick: 1026384294705526016008n, available: 3039224313814729791n },
      { tick: 1026384294705526016040n, available: 33813858744264434151n },
      { tick: 1231991899848122112040n, available: 41525328533321047597n },
      { tick: 1231991899848122112068n, available: 120728038297924509n },
      { tick: 1355191089832934323208n, available: 24245052107008492675n },
      { tick: 1512727272727272448008n, available: 1000n },
      { tick: 1512727272727272448036n, available: 1n },
      { tick: 1664000000000000000036n, available: 6n },
      { tick: 1920000000000000000032n, available: 1198n },
      { tick: 1920000000000000000068n, available: 1n },
    ];

    router = new TickRouter([259200, 604800, 2592000], [3170979198n, 9512937595n, 15854895991n]);
    console.log(router.forecast(nodes, 3 * 86400, 1, 10));
    console.log(router.route(nodes, 5293715194659901904n, 3 * 86400, 1, 10));
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

  it('#_traverseNodes', function () {
    expect(router._traverseNodes(router._decodeNodes(TEST_NODES_1), 1)).toEqual({
      amount: 100n,
      route: [
        { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
        { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
        { tick: { limit: 100n, duration: 0, rate: 1, reserved: 0n }, available: 150n },
      ],
    });

    expect(router._traverseNodes(router._decodeNodes(TEST_NODES_1), 3)).toEqual({
      amount: 300n,
      route: [
        { tick: { limit: 25n, duration: 2, rate: 0, reserved: 0n }, available: 500n },
        { tick: { limit: 50n, duration: 1, rate: 0, reserved: 0n }, available: 250n },
        { tick: { limit: 100n, duration: 0, rate: 1, reserved: 0n }, available: 150n },
      ],
    });

    expect(router._traverseNodes(router._decodeNodes(TEST_NODES_2), 1)).toEqual({
      amount: 25n,
      route: [
        { tick: { limit: 5n, duration: 0, rate: 0, reserved: 0n }, available: 5n },
        { tick: { limit: 10n, duration: 0, rate: 0, reserved: 0n }, available: 1n },
        { tick: { limit: 10n, duration: 0, rate: 1, reserved: 0n }, available: 4n },
        { tick: { limit: 15n, duration: 0, rate: 2, reserved: 0n }, available: 10n },
        { tick: { limit: 20n, duration: 0, rate: 1, reserved: 0n }, available: 4n },
        { tick: { limit: 20n, duration: 0, rate: 2, reserved: 0n }, available: 1n },
        { tick: { limit: 25n, duration: 0, rate: 0, reserved: 0n }, available: 5n },
      ],
    });
  });

  it('#_sourceNodes', function () {
    expect(router._sourceNodes(router._decodeNodes(TEST_NODES_3), 999999n, 1)).toEqual([
      200n,
      [0n, 50n, 50n, 50n, 50n],
    ]);
    expect(router._sourceNodes(router._decodeNodes(TEST_NODES_3), 100n, 1)).toEqual([100n, [0n, 50n, 50n, 0n, 0n]]);
    expect(router._sourceNodes(router._decodeNodes(TEST_NODES_3), 50n, 1)).toEqual([50n, [0n, 50n, 0n, 0n, 0n]]);

    expect(router._sourceNodes(router._decodeNodes(TEST_NODES_3), 999999n, 3)).toEqual([
      550n,
      [0n, 150n, 150n, 150n, 100n],
    ]);
    expect(router._sourceNodes(router._decodeNodes(TEST_NODES_3), 300n, 3)).toEqual([300n, [0n, 150n, 150n, 0n, 0n]]);
    expect(router._sourceNodes(router._decodeNodes(TEST_NODES_3), 50n, 3)).toEqual([50n, [0n, 50n, 0n, 0n, 0n]]);
  });

  it('#_pruneNodes', function () {
    expect(router._sourceNodes(router._decodeNodes(TEST_NODES_4), 999999n, 1)[0]).toEqual(354n);

    expect(router._pruneNodes(router._decodeNodes(TEST_NODES_4), 1, 3)).toEqual([
      { tick: { limit: 200n, duration: 0, rate: 2, reserved: 0n }, available: 100n },
      { tick: { limit: 300n, duration: 0, rate: 2, reserved: 0n }, available: 100n },
      { tick: { limit: 400n, duration: 0, rate: 2, reserved: 0n }, available: 100n },
    ]);

    expect(router._pruneNodes(router._decodeNodes(TEST_NODES_4), 1, 3)).toEqual([
      { tick: { limit: 200n, duration: 0, rate: 2, reserved: 0n }, available: 100n },
      { tick: { limit: 300n, duration: 0, rate: 2, reserved: 0n }, available: 100n },
      { tick: { limit: 400n, duration: 0, rate: 2, reserved: 0n }, available: 100n },
    ]);

    expect(router._pruneNodes(router._decodeNodes(TEST_NODES_4), 1, 5)).toEqual([
      { tick: { limit: 50n, duration: 0, rate: 0, reserved: 0n }, available: 100n },
      { tick: { limit: 100n, duration: 0, rate: 0, reserved: 0n }, available: 1n },
      { tick: { limit: 200n, duration: 0, rate: 2, reserved: 0n }, available: 100n },
      { tick: { limit: 300n, duration: 0, rate: 2, reserved: 0n }, available: 100n },
      { tick: { limit: 400n, duration: 0, rate: 2, reserved: 0n }, available: 100n },
    ]);
  });

  it.only('#apply', function () {
    /* Test applying node receipts with 100% proration */
    expect(router.apply(TEST_NODES_6, TEST_NODE_RECEIPTS_1, 1.0)).toEqual([
      { tick: TickEncoder.encode({ limit: 50n * 10n ** 18n, duration: 0, rate: 0 }), available: 110n * 10n ** 18n },
      { tick: TickEncoder.encode({ limit: 100n * 10n ** 18n, duration: 0, rate: 0 }), available: 0n },
      { tick: TickEncoder.encode({ limit: 125n * 10n ** 18n, duration: 0, rate: 0 }), available: 10n * 10n ** 18n },
      { tick: TickEncoder.encode({ limit: 150n * 10n ** 18n, duration: 0, rate: 1 }), available: 35n * 10n ** 18n },
      { tick: TickEncoder.encode({ limit: 200n * 10n ** 18n, duration: 0, rate: 1 }), available: 15n * 10n ** 18n },
    ]);

    /* Test applying node receiptions with 50% proration */
    expect(router.apply(TEST_NODES_6, TEST_NODE_RECEIPTS_1, 0.5)).toEqual([
      { tick: TickEncoder.encode({ limit: 50n * 10n ** 18n, duration: 0, rate: 0 }), available: 105n * 10n ** 18n },
      { tick: TickEncoder.encode({ limit: 100n * 10n ** 18n, duration: 0, rate: 0 }), available: 1n },
      { tick: TickEncoder.encode({ limit: 125n * 10n ** 18n, duration: 0, rate: 0 }), available: 75n * 10n ** 17n },
      { tick: TickEncoder.encode({ limit: 150n * 10n ** 18n, duration: 0, rate: 1 }), available: 31n * 10n ** 18n },
      { tick: TickEncoder.encode({ limit: 200n * 10n ** 18n, duration: 0, rate: 1 }), available: 10n * 10n ** 18n },
    ]);

    /* Check for missing in liquidity node */
    expect(() =>
      router.apply(
        [TEST_NODES_6[0], TEST_NODES_6[1], { ...TEST_NODES_6[2], value: undefined }],
        TEST_NODE_RECEIPTS_1,
        0.5,
      ),
    ).toThrow(/Missing required fields in liquidity node with tick/);
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
    expect(router.forecast(TEST_NODES_4, 3 * 86400, 1)).toEqual(354n);
    expect(router.forecast(TEST_NODES_4, 3 * 86400, 3)).toEqual(404n);

    /* Nodes with dust, with reduced number of nodes */
    expect(router.forecast(TEST_NODES_4, 3 * 86400, 1, 3)).toEqual(300n);
    expect(router.forecast(TEST_NODES_4, 3 * 86400, 3, 3)).toEqual(300n);
  });

  it('#route', function () {
    /* 3 days */
    expect(router.route(TEST_NODES_1, 100n, 3 * 86400, 1)).toEqual([
      [
        TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
        TickEncoder.encode({ limit: 50n, duration: 1, rate: 0 }),
        TickEncoder.encode({ limit: 100n, duration: 0, rate: 1 }),
      ],
      [25n, 25n, 50n],
    ]);
    expect(router.route(TEST_NODES_1, 300n, 3 * 86400, 3)).toEqual([
      [
        TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
        TickEncoder.encode({ limit: 50n, duration: 1, rate: 0 }),
        TickEncoder.encode({ limit: 100n, duration: 0, rate: 1 }),
      ],
      [75n, 75n, 150n],
    ]);

    /* 10 days */
    expect(router.route(TEST_NODES_1, 100n, 10 * 86400, 1)).toEqual([
      [
        TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
        TickEncoder.encode({ limit: 50n, duration: 1, rate: 0 }),
        TickEncoder.encode({ limit: 100n, duration: 1, rate: 2 }),
      ],
      [25n, 25n, 50n],
    ]);
    expect(router.route(TEST_NODES_1, 250n, 10 * 86400, 3)).toEqual([
      [
        TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
        TickEncoder.encode({ limit: 50n, duration: 1, rate: 0 }),
        TickEncoder.encode({ limit: 100n, duration: 1, rate: 2 }),
      ],
      [75n, 75n, 100n],
    ]);

    /* 30 days */
    expect(router.route(TEST_NODES_1, 50n, 30 * 86400, 1)).toEqual([
      [
        TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
        TickEncoder.encode({ limit: 50n, duration: 2, rate: 1 }),
      ],
      [25n, 25n],
    ]);
    expect(router.route(TEST_NODES_1, 100n, 30 * 86400, 3)).toEqual([
      [
        TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
        TickEncoder.encode({ limit: 50n, duration: 2, rate: 1 }),
      ],
      [75n, 25n],
    ]);

    /* 30 days, over available */
    expect(() => router.route(TEST_NODES_1, 51n, 30 * 86400, 1)).toThrow(/Insufficient liquidity/);

    /* 35 days */
    expect(router.route(TEST_NODES_1, 0n, 35 * 86400, 1)).toEqual([[], []]);
    expect(() => router.route(TEST_NODES_1, 1n, 35 * 86400, 1)).toThrow(/Insufficient liquidity/);

    /* Nodes with dust */
    expect(router.route(TEST_NODES_4, 350n, 3 * 86400, 1)).toEqual([
      [
        TickEncoder.encode({ limit: 50n, duration: 0, rate: 0 }),
        TickEncoder.encode({ limit: 100n, duration: 0, rate: 0 }),
        TickEncoder.encode({ limit: 150n, duration: 0, rate: 1 }),
        TickEncoder.encode({ limit: 200n, duration: 0, rate: 2 }),
        TickEncoder.encode({ limit: 250n, duration: 0, rate: 1 }),
        TickEncoder.encode({ limit: 300n, duration: 0, rate: 2 }),
        TickEncoder.encode({ limit: 350n, duration: 0, rate: 2 }),
        TickEncoder.encode({ limit: 400n, duration: 0, rate: 2 }),
      ],
      [50n, 1n, 1n, 100n, 1n, 100n, 1n, 96n],
    ]);
    expect(router.route(TEST_NODES_4, 400n, 3 * 86400, 3)).toEqual([
      [
        TickEncoder.encode({ limit: 50n, duration: 0, rate: 0 }),
        TickEncoder.encode({ limit: 100n, duration: 0, rate: 0 }),
        TickEncoder.encode({ limit: 150n, duration: 0, rate: 1 }),
        TickEncoder.encode({ limit: 200n, duration: 0, rate: 2 }),
        TickEncoder.encode({ limit: 250n, duration: 0, rate: 1 }),
        TickEncoder.encode({ limit: 300n, duration: 0, rate: 2 }),
        TickEncoder.encode({ limit: 350n, duration: 0, rate: 2 }),
        TickEncoder.encode({ limit: 400n, duration: 0, rate: 2 }),
      ],
      [100n, 1n, 1n, 100n, 1n, 100n, 1n, 96n],
    ]);

    /* Nodes with dust, with reduced number of nodes */
    expect(router.route(TEST_NODES_4, 250n, 3 * 86400, 1, 3)).toEqual([
      [
        TickEncoder.encode({ limit: 200n, duration: 0, rate: 2 }),
        TickEncoder.encode({ limit: 300n, duration: 0, rate: 2 }),
        TickEncoder.encode({ limit: 400n, duration: 0, rate: 2 }),
      ],
      [100n, 100n, 50n],
    ]);
  });

  it('#quote', function () {
    const ticks1 = router.route(TEST_NODES_5, 200n * 10n ** 18n, 3 * 86400, 1)[0];
    expect(router.quote(TEST_NODES_5, [], 0n, 3 * 86400, 1)).toEqual(0n);
    expect(router.quote(TEST_NODES_5, ticks1, 0n, 3 * 86400, 1)).toEqual(0n);
    expect(router.quote(TEST_NODES_5, ticks1, 200n * 10n ** 18n, 3 * 86400, 1)).toEqual(200410958904060800000n);
    expect(() => router.quote(TEST_NODES_5, [], 200n * 10n ** 18n, 3 * 86400, 1)).toThrow(/Insufficient liquidity/);
    expect(() => router.quote(TEST_NODES_5, ticks1, 300n * 10n ** 18n, 3 * 86400, 1)).toThrow(/Insufficient liquidity/);

    const ticks2 = router.route(TEST_NODES_5, 200n * 10n ** 18n, 3 * 86400, 3)[0];
    expect(router.quote(TEST_NODES_5, ticks2, 550n * 10n ** 18n, 3 * 86400, 3)).toEqual(551027397260216800000n);
  });
});
