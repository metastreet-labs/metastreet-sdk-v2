import { TickRouter, LiquidityNode } from '../src';
import { TickEncoder } from '../src';

const TEST_NODES: LiquidityNode[] = [
  { tick: TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }), available: 500n },
  { tick: TickEncoder.encode({ limit: 50n, duration: 2, rate: 0 }), available: 250n },
  { tick: TickEncoder.encode({ limit: 50n, duration: 2, rate: 1 }), available: 250n },
  { tick: TickEncoder.encode({ limit: 50n, duration: 2, rate: 2 }), available: 500n },
  { tick: TickEncoder.encode({ limit: 100n, duration: 1, rate: 1 }), available: 300n },
  { tick: TickEncoder.encode({ limit: 100n, duration: 2, rate: 0 }), available: 200n },
  { tick: TickEncoder.encode({ limit: 125n, duration: 1, rate: 0 }), available: 100n },
  { tick: TickEncoder.encode({ limit: 125n, duration: 1, rate: 1 }), available: 200n },
  { tick: TickEncoder.encode({ limit: 150n, duration: 0, rate: 0 }), available: 50n },
  { tick: TickEncoder.encode({ limit: 150n, duration: 0, rate: 1 }), available: 75n },
];

describe('TickRouter', function () {
  let router: TickRouter;

  beforeEach(function () {
    router = new TickRouter([7 * 86400, 14 * 86400, 30 * 86400], [3170979198n, 9512937595n, 15854895991n]);
  });

  it('#_mapDuration', function () {
    expect(router._mapDuration(3 * 86400)).toEqual(0);
    expect(router._mapDuration(7 * 86400)).toEqual(0);
    expect(router._mapDuration(10 * 86400)).toEqual(1);
    expect(router._mapDuration(14 * 86400)).toEqual(1);
    expect(router._mapDuration(25 * 86400)).toEqual(2);
    expect(router._mapDuration(30 * 86400)).toEqual(2);
    expect(() => router._mapDuration(35 * 86400)).toThrow();
  });

  it('#_filterNodes', function () {
    expect(router._filterNodes(TEST_NODES, 3 * 86400).map((n) => n.tick)).toEqual([
      { limit: 25n, duration: 2, rate: 0, reserved: 0n },
      { limit: 50n, duration: 2, rate: 0, reserved: 0n },
      { limit: 100n, duration: 2, rate: 0, reserved: 0n },
      { limit: 125n, duration: 1, rate: 0, reserved: 0n },
      { limit: 150n, duration: 0, rate: 0, reserved: 0n },
    ]);

    expect(router._filterNodes(TEST_NODES, 10 * 86400).map((n) => n.tick)).toEqual([
      { limit: 25n, duration: 2, rate: 0, reserved: 0n },
      { limit: 50n, duration: 2, rate: 0, reserved: 0n },
      { limit: 100n, duration: 2, rate: 0, reserved: 0n },
      { limit: 125n, duration: 1, rate: 0, reserved: 0n },
    ]);

    expect(router._filterNodes(TEST_NODES, 30 * 86400).map((n) => n.tick)).toEqual([
      { limit: 25n, duration: 2, rate: 0, reserved: 0n },
      { limit: 50n, duration: 2, rate: 0, reserved: 0n },
      { limit: 100n, duration: 2, rate: 0, reserved: 0n },
    ]);
  });

  it('#forecast', function () {
    expect(router.forecast(TEST_NODES, 3 * 86400, 1)).toEqual(150n);
    expect(router.forecast(TEST_NODES, 3 * 86400, 3)).toEqual(425n);
    expect(router.forecast(TEST_NODES, 10 * 86400, 1)).toEqual(125n);
    expect(router.forecast(TEST_NODES, 10 * 86400, 3)).toEqual(375n);
    expect(router.forecast(TEST_NODES, 30 * 86400, 1)).toEqual(100n);
    expect(router.forecast(TEST_NODES, 30 * 86400, 3)).toEqual(300n);
  });

  it('#route', function () {
    expect(router.route(TEST_NODES, 125n, 3 * 86400, 1, 4)).toEqual([
      TickEncoder.encode({ limit: 50n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 100n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 125n, duration: 1, rate: 0 }),
      TickEncoder.encode({ limit: 150n, duration: 0, rate: 0 }),
    ]);
    expect(router.route(TEST_NODES, 425n, 3 * 86400, 3, 4)).toEqual([
      TickEncoder.encode({ limit: 50n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 100n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 125n, duration: 1, rate: 0 }),
      TickEncoder.encode({ limit: 150n, duration: 0, rate: 0 }),
    ]);
    expect(router.route(TEST_NODES, 125n, 10 * 86400, 1, 4)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 100n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 125n, duration: 1, rate: 0 }),
    ]);
    expect(router.route(TEST_NODES, 375n, 10 * 86400, 3, 4)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 100n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 125n, duration: 1, rate: 0 }),
    ]);
    expect(router.route(TEST_NODES, 100n, 30 * 86400, 1, 4)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 100n, duration: 2, rate: 0 }),
    ]);
    expect(router.route(TEST_NODES, 300n, 30 * 86400, 3, 4)).toEqual([
      TickEncoder.encode({ limit: 25n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 50n, duration: 2, rate: 0 }),
      TickEncoder.encode({ limit: 100n, duration: 2, rate: 0 }),
    ]);
    expect(() => router.route(TEST_NODES, 500n, 30 * 86400, 5, 4)).toThrow();
  });
});
