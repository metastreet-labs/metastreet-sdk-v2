import { TickEncoder, LimitType } from '../src';

describe('Tick', function () {
  it('#decode', function () {
    expect(TickEncoder.decode(0x6b13680ef11f9000044n)).toEqual({
      limit: 123450000000000000000n,
      duration: 2,
      rate: 1,
      limitType: LimitType.Absolute,
    });

    expect(TickEncoder.decode(0x3782dace9d9000045n)).toEqual({
      limit: 250000000000000000n,
      duration: 2,
      rate: 1,
      limitType: LimitType.Ratio,
    });
  });

  it('#encode', function () {
    expect(
      TickEncoder.encode({
        limit: 123450000000000000000n,
        duration: 2,
        rate: 1,
        limitType: LimitType.Absolute,
      }),
    ).toEqual(0x6b13680ef11f9000044n);

    expect(
      TickEncoder.encode({
        limit: 250000000000000000n,
        duration: 2,
        rate: 1,
        limitType: LimitType.Ratio,
      }),
    ).toEqual(0x3782dace9d9000045n);
  });
});
