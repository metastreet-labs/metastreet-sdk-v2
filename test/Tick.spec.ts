import { TickEncoder } from '../src';

describe('Tick', function () {
  it('#decode', function () {
    expect(TickEncoder.decode(0x6b13680ef11f9000044n)).toEqual({
      limit: 123450000000000000000n,
      duration: 2,
      rate: 1,
      reserved: 0n,
    });
  });

  it('#encode', function () {
    expect(
      TickEncoder.encode({
        limit: 123450000000000000000n,
        duration: 2,
        rate: 1,
      }),
    ).toEqual(0x6b13680ef11f9000044n);
  });
});
