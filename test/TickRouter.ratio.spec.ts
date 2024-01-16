import { TickRouter, LiquidityNode } from '../src';
import { LimitType, TickEncoder } from '../src';

const TEST_NODES: LiquidityNode[] = [
  { tick: TickEncoder.encode({ limit: 0n, duration: 0, rate: 0 }), available: 0n },
  {
    tick: TickEncoder.encode({ limit: 10n * 10n ** 16n, duration: 0, rate: 1, limitType: LimitType.Ratio }),
    available: 100n * 10n ** 18n,
  },
  {
    tick: TickEncoder.encode({ limit: 25n * 10n ** 16n, duration: 0, rate: 0, limitType: LimitType.Ratio }),
    available: 100n * 10n ** 18n,
  },
  {
    tick: TickEncoder.encode({ limit: 50n * 10n ** 16n, duration: 0, rate: 2, limitType: LimitType.Ratio }),
    available: 100n * 10n ** 18n,
  },
  {
    tick: TickEncoder.encode({ limit: 75n * 10n ** 16n, duration: 0, rate: 2, limitType: LimitType.Ratio }),
    available: 100n * 10n ** 18n,
  },
  { tick: TickEncoder.encode({ limit: 50n * 10n ** 18n, duration: 0, rate: 0 }), available: 1000n * 10n ** 18n },
  { tick: TickEncoder.encode({ limit: 100n * 10n ** 18n, duration: 0, rate: 0 }), available: 500n * 10n ** 18n },
  { tick: TickEncoder.encode({ limit: 150n * 10n ** 18n, duration: 0, rate: 1 }), available: 250n * 10n ** 18n },
  { tick: TickEncoder.encode({ limit: 200n * 10n ** 18n, duration: 0, rate: 2 }), available: 100n * 10n ** 18n },
];

describe('TickRouter (ratio)', function () {
  let router: TickRouter;

  beforeEach(function () {
    router = new TickRouter([30 * 86400, 14 * 86400, 7 * 86400], [3170979198n, 9512937595n, 15854895991n]);
  });

  it('#_decodeNodes', function () {
    /* Without collateral value */
    expect(router._decodeNodes(TEST_NODES)).toEqual([
      { tick: { limit: 0n, duration: 0, rate: 0, limitType: LimitType.Absolute }, limit: 0n, available: 0n },
      {
        tick: { limit: 10n * 10n ** 16n, duration: 0, rate: 1, limitType: LimitType.Ratio },
        limit: 0n,
        available: 100n * 10n ** 18n,
      },
      {
        tick: { limit: 25n * 10n ** 16n, duration: 0, rate: 0, limitType: LimitType.Ratio },
        limit: 0n,
        available: 100n * 10n ** 18n,
      },
      {
        tick: { limit: 50n * 10n ** 16n, duration: 0, rate: 2, limitType: LimitType.Ratio },
        limit: 0n,
        available: 100n * 10n ** 18n,
      },
      {
        tick: { limit: 75n * 10n ** 16n, duration: 0, rate: 2, limitType: LimitType.Ratio },
        limit: 0n,
        available: 100n * 10n ** 18n,
      },
      {
        tick: { limit: 50n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute },
        limit: 50n * 10n ** 18n,
        available: 1000n * 10n ** 18n,
      },
      {
        tick: { limit: 100n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute },
        limit: 100n * 10n ** 18n,
        available: 500n * 10n ** 18n,
      },
      {
        tick: { limit: 150n * 10n ** 18n, duration: 0, rate: 1, limitType: LimitType.Absolute },
        limit: 150n * 10n ** 18n,
        available: 250n * 10n ** 18n,
      },
      {
        tick: { limit: 200n * 10n ** 18n, duration: 0, rate: 2, limitType: LimitType.Absolute },
        limit: 200n * 10n ** 18n,
        available: 100n * 10n ** 18n,
      },
    ]);

    /* With collateral value */
    expect(router._decodeNodes(TEST_NODES, 400n * 10n ** 18n)).toEqual([
      { tick: { limit: 0n, duration: 0, rate: 0, limitType: LimitType.Absolute }, limit: 0n, available: 0n },
      {
        tick: { limit: 10n * 10n ** 16n, duration: 0, rate: 1, limitType: LimitType.Ratio },
        limit: 40n * 10n ** 18n,
        available: 100n * 10n ** 18n,
      },
      {
        tick: { limit: 25n * 10n ** 16n, duration: 0, rate: 0, limitType: LimitType.Ratio },
        limit: 100n * 10n ** 18n,
        available: 100n * 10n ** 18n,
      },
      {
        tick: { limit: 50n * 10n ** 16n, duration: 0, rate: 2, limitType: LimitType.Ratio },
        limit: 200n * 10n ** 18n,
        available: 100n * 10n ** 18n,
      },
      {
        tick: { limit: 75n * 10n ** 16n, duration: 0, rate: 2, limitType: LimitType.Ratio },
        limit: 300n * 10n ** 18n,
        available: 100n * 10n ** 18n,
      },
      {
        tick: { limit: 50n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute },
        limit: 50n * 10n ** 18n,
        available: 1000n * 10n ** 18n,
      },
      {
        tick: { limit: 100n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute },
        limit: 100n * 10n ** 18n,
        available: 500n * 10n ** 18n,
      },
      {
        tick: { limit: 150n * 10n ** 18n, duration: 0, rate: 1, limitType: LimitType.Absolute },
        limit: 150n * 10n ** 18n,
        available: 250n * 10n ** 18n,
      },
      {
        tick: { limit: 200n * 10n ** 18n, duration: 0, rate: 2, limitType: LimitType.Absolute },
        limit: 200n * 10n ** 18n,
        available: 100n * 10n ** 18n,
      },
    ]);
  });

  it('#_traverseNodes', function () {
    /* Without collateral value */
    expect(router._traverseNodes(router._decodeNodes(TEST_NODES), 1)).toEqual({
      amount: 200n * 10n ** 18n,
      route: [
        {
          tick: { limit: 50n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute },
          limit: 50n * 10n ** 18n,
          available: 1000n * 10n ** 18n,
        },
        {
          tick: { limit: 100n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute },
          limit: 100n * 10n ** 18n,
          available: 500n * 10n ** 18n,
        },
        {
          tick: { limit: 150n * 10n ** 18n, duration: 0, rate: 1, limitType: LimitType.Absolute },
          limit: 150n * 10n ** 18n,
          available: 250n * 10n ** 18n,
        },
        {
          tick: { limit: 200n * 10n ** 18n, duration: 0, rate: 2, limitType: LimitType.Absolute },
          limit: 200n * 10n ** 18n,
          available: 100n * 10n ** 18n,
        },
      ],
    });
    expect(router._traverseNodes(router._decodeNodes(TEST_NODES), 3)).toEqual({
      amount: 550n * 10n ** 18n,
      route: [
        {
          tick: { limit: 50n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute },
          limit: 50n * 10n ** 18n,
          available: 1000n * 10n ** 18n,
        },
        {
          tick: { limit: 100n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute },
          limit: 100n * 10n ** 18n,
          available: 500n * 10n ** 18n,
        },
        {
          tick: { limit: 150n * 10n ** 18n, duration: 0, rate: 1, limitType: LimitType.Absolute },
          limit: 150n * 10n ** 18n,
          available: 250n * 10n ** 18n,
        },
        {
          tick: { limit: 200n * 10n ** 18n, duration: 0, rate: 2, limitType: LimitType.Absolute },
          limit: 200n * 10n ** 18n,
          available: 100n * 10n ** 18n,
        },
      ],
    });

    /* With collateral value */
    expect(router._traverseNodes(router._decodeNodes(TEST_NODES, 400n * 10n ** 18n), 1)).toEqual({
      amount: 300n * 10n ** 18n,
      route: [
        {
          tick: { limit: 10n * 10n ** 16n, duration: 0, rate: 1, limitType: LimitType.Ratio },
          limit: 40n * 10n ** 18n,
          available: 100n * 10n ** 18n,
        },
        {
          tick: { limit: 50n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute },
          limit: 50n * 10n ** 18n,
          available: 1000n * 10n ** 18n,
        },
        {
          tick: { limit: 100n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute },
          limit: 100n * 10n ** 18n,
          available: 500n * 10n ** 18n,
        },
        {
          tick: { limit: 150n * 10n ** 18n, duration: 0, rate: 1, limitType: LimitType.Absolute },
          limit: 150n * 10n ** 18n,
          available: 250n * 10n ** 18n,
        },
        {
          tick: { limit: 200n * 10n ** 18n, duration: 0, rate: 2, limitType: LimitType.Absolute },
          limit: 200n * 10n ** 18n,
          available: 100n * 10n ** 18n,
        },
        {
          tick: { limit: 75n * 10n ** 16n, duration: 0, rate: 2, limitType: LimitType.Ratio },
          limit: 300n * 10n ** 18n,
          available: 100n * 10n ** 18n,
        },
      ],
    });

    expect(router._traverseNodes(router._decodeNodes(TEST_NODES, 400n * 10n ** 18n), 3)).toEqual({
      amount: 700n * 10n ** 18n,
      route: [
        {
          tick: { limit: 10n * 10n ** 16n, duration: 0, rate: 1, limitType: LimitType.Ratio },
          limit: 40n * 10n ** 18n,
          available: 100n * 10n ** 18n,
        },
        {
          tick: { limit: 50n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute },
          limit: 50n * 10n ** 18n,
          available: 1000n * 10n ** 18n,
        },
        {
          tick: { limit: 100n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute },
          limit: 100n * 10n ** 18n,
          available: 500n * 10n ** 18n,
        },
        {
          tick: { limit: 150n * 10n ** 18n, duration: 0, rate: 1, limitType: LimitType.Absolute },
          limit: 150n * 10n ** 18n,
          available: 250n * 10n ** 18n,
        },
        {
          tick: { limit: 200n * 10n ** 18n, duration: 0, rate: 2, limitType: LimitType.Absolute },
          limit: 200n * 10n ** 18n,
          available: 100n * 10n ** 18n,
        },
        {
          tick: { limit: 50n * 10n ** 16n, duration: 0, rate: 2, limitType: LimitType.Ratio },
          limit: 200n * 10n ** 18n,
          available: 100n * 10n ** 18n,
        },
        {
          tick: { limit: 75n * 10n ** 16n, duration: 0, rate: 2, limitType: LimitType.Ratio },
          limit: 300n * 10n ** 18n,
          available: 100n * 10n ** 18n,
        },
      ],
    });
  });

  it('#forecast', function () {
    /* Without collateral value */
    expect(router.forecast(TEST_NODES, 30 * 86400, 1)).toEqual(200n * 10n ** 18n);
    expect(router.forecast(TEST_NODES, 30 * 86400, 3)).toEqual(550n * 10n ** 18n);

    /* With collateral value */
    expect(router.forecast(TEST_NODES, 30 * 86400, 1, 400n * 10n ** 18n)).toEqual(300n * 10n ** 18n);
    expect(router.forecast(TEST_NODES, 30 * 86400, 3, 400n * 10n ** 18n)).toEqual(700n * 10n ** 18n);
  });

  it('#route', function () {
    /* Without collateral value */
    expect(router.route(TEST_NODES, 200n * 10n ** 18n, 30 * 86400, 1)).toEqual([
      [
        TickEncoder.encode({ limit: 50n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute }),
        TickEncoder.encode({ limit: 100n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute }),
        TickEncoder.encode({ limit: 150n * 10n ** 18n, duration: 0, rate: 1, limitType: LimitType.Absolute }),
        TickEncoder.encode({ limit: 200n * 10n ** 18n, duration: 0, rate: 2, limitType: LimitType.Absolute }),
      ],
      [50n * 10n ** 18n, 50n * 10n ** 18n, 50n * 10n ** 18n, 50n * 10n ** 18n],
    ]);
    expect(router.route(TEST_NODES, 550n * 10n ** 18n, 30 * 86400, 3)).toEqual([
      [
        TickEncoder.encode({ limit: 50n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute }),
        TickEncoder.encode({ limit: 100n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute }),
        TickEncoder.encode({ limit: 150n * 10n ** 18n, duration: 0, rate: 1, limitType: LimitType.Absolute }),
        TickEncoder.encode({ limit: 200n * 10n ** 18n, duration: 0, rate: 2, limitType: LimitType.Absolute }),
      ],
      [150n * 10n ** 18n, 150n * 10n ** 18n, 150n * 10n ** 18n, 100n * 10n ** 18n],
    ]);

    /* With collateral value */
    expect(router.route(TEST_NODES, 300n * 10n ** 18n, 30 * 86400, 1, 400n * 10n ** 18n)).toEqual([
      [
        TickEncoder.encode({ limit: 10n * 10n ** 16n, duration: 0, rate: 1, limitType: LimitType.Ratio }),
        TickEncoder.encode({ limit: 50n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute }),
        TickEncoder.encode({ limit: 100n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute }),
        TickEncoder.encode({ limit: 150n * 10n ** 18n, duration: 0, rate: 1, limitType: LimitType.Absolute }),
        TickEncoder.encode({ limit: 200n * 10n ** 18n, duration: 0, rate: 2, limitType: LimitType.Absolute }),
        TickEncoder.encode({ limit: 75n * 10n ** 16n, duration: 0, rate: 2, limitType: LimitType.Ratio }),
      ],
      [40n * 10n ** 18n, 10n * 10n ** 18n, 50n * 10n ** 18n, 50n * 10n ** 18n, 50n * 10n ** 18n, 100n * 10n ** 18n],
    ]);
    expect(router.route(TEST_NODES, 700n * 10n ** 18n, 30 * 86400, 3, 400n * 10n ** 18n)).toEqual([
      [
        TickEncoder.encode({ limit: 10n * 10n ** 16n, duration: 0, rate: 1, limitType: LimitType.Ratio }),
        TickEncoder.encode({ limit: 50n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute }),
        TickEncoder.encode({ limit: 100n * 10n ** 18n, duration: 0, rate: 0, limitType: LimitType.Absolute }),
        TickEncoder.encode({ limit: 150n * 10n ** 18n, duration: 0, rate: 1, limitType: LimitType.Absolute }),
        TickEncoder.encode({ limit: 200n * 10n ** 18n, duration: 0, rate: 2, limitType: LimitType.Absolute }),
        TickEncoder.encode({ limit: 50n * 10n ** 16n, duration: 0, rate: 2, limitType: LimitType.Ratio }),
        TickEncoder.encode({ limit: 75n * 10n ** 16n, duration: 0, rate: 2, limitType: LimitType.Ratio }),
      ],
      [
        100n * 10n ** 18n,
        50n * 10n ** 18n,
        150n * 10n ** 18n,
        150n * 10n ** 18n,
        100n * 10n ** 18n,
        50n * 10n ** 18n,
        100n * 10n ** 18n,
      ],
    ]);

    /* Over available, with collateral value */
    expect(() => router.route(TEST_NODES, 300n * 10n ** 18n + 1n, 30 * 86400, 1, 400n * 10n ** 18n)).toThrow(
      /Insufficient liquidity/,
    );
  });

  it('#quote', function () {
    /* Without collateral value */
    {
      const ticks = router.route(TEST_NODES, 200n * 10n ** 18n, 3 * 86400, 1)[0];
      expect(router.quote(TEST_NODES, [], 0n, 3 * 86400, 1)).toEqual(0n);
      expect(router.quote(TEST_NODES, ticks, 0n, 3 * 86400, 1)).toEqual(0n);
      expect(router.quote(TEST_NODES, ticks, 200n * 10n ** 18n, 3 * 86400, 1)).toEqual(200410958904060800000n);
      expect(() => router.quote(TEST_NODES, [], 200n * 10n ** 18n, 3 * 86400, 1)).toThrow(/Insufficient liquidity/);
      expect(() => router.quote(TEST_NODES, ticks, 300n * 10n ** 18n, 3 * 86400, 1)).toThrow(/Insufficient liquidity/);
    }

    /* Without collateral value, bundle */
    {
      const ticks = router.route(TEST_NODES, 200n * 10n ** 18n, 3 * 86400, 3)[0];
      expect(router.quote(TEST_NODES, ticks, 550n * 10n ** 18n, 3 * 86400, 3)).toEqual(551027397260216800000n);
    }

    /* With collateral value */
    {
      const ticks = router.route(TEST_NODES, 300n * 10n ** 18n, 3 * 86400, 1, 400n * 10n ** 18n)[0];
      expect(router.quote(TEST_NODES, [], 0n, 3 * 86400, 1, 400n * 10n ** 18n)).toEqual(0n);
      expect(router.quote(TEST_NODES, ticks, 0n, 3 * 86400, 1, 400n * 10n ** 18n)).toEqual(0n);
      expect(router.quote(TEST_NODES, ticks, 300n * 10n ** 18n, 3 * 86400, 1, 400n * 10n ** 18n)).toEqual(
        300887671232786880000n,
      );
      expect(() => router.quote(TEST_NODES, [], 300n * 10n ** 18n, 3 * 86400, 1, 400n * 10n ** 18n)).toThrow(
        /Insufficient liquidity/,
      );
      expect(() => router.quote(TEST_NODES, ticks, 300n * 10n ** 18n + 1n, 3 * 86400, 1, 400n * 10n ** 18n)).toThrow(
        /Insufficient liquidity/,
      );
    }

    /* With collateral value, bundle */
    {
      const ticks = router.route(TEST_NODES, 700n * 10n ** 18n, 3 * 86400, 3, 400n * 10n ** 18n)[0];
      expect(router.quote(TEST_NODES, ticks, 700n * 10n ** 18n, 3 * 86400, 3, 400n * 10n ** 18n)).toEqual(
        701808219177997120000n,
      );
    }
  });
});
