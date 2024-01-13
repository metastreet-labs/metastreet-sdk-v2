export type EncodedTick = bigint;

export interface DecodedTick {
  limit: bigint;
  duration: Index;
  rate: Index;
  limitType?: LimitType;
}

export type Index = number;

export enum LimitType {
  Absolute,
  Ratio,
}

const TICK_LIMIT_MASK = 0xffffffffffffffffffffffffffffffn;
const TICK_LIMIT_SHIFT = 8n;
const TICK_DURATION_MASK = 0x7n;
const TICK_DURATION_SHIFT = 5n;
const TICK_RATE_MASK = 0x7n;
const TICK_RATE_SHIFT = 2n;
const TICK_LIMIT_TYPE_MASK = 0x3n;
const TICK_LIMIT_TYPE_SHIFT = 0n;

export class TickEncoder {
  /**
   * Decode a tick
   * @param tick Encoded tick
   * @returns Decoded tick
   */
  static decode(tick: EncodedTick): DecodedTick {
    const limitType = Number((tick >> TICK_LIMIT_TYPE_SHIFT) & TICK_LIMIT_TYPE_MASK);
    if (limitType != LimitType.Absolute && limitType != LimitType.Ratio)
      throw new Error(`Invalid tick limit type: ${limitType.toString()}`);

    return {
      limit: (tick >> TICK_LIMIT_SHIFT) & TICK_LIMIT_MASK,
      duration: Number((tick >> TICK_DURATION_SHIFT) & TICK_DURATION_MASK),
      rate: Number((tick >> TICK_RATE_SHIFT) & TICK_RATE_MASK),
      limitType,
    };
  }

  /**
   * Encode a tick
   * @param tick Decoded tick
   * @returns Encoded tick
   */
  static encode(tick: DecodedTick): EncodedTick {
    return (
      ((tick.limit & TICK_LIMIT_MASK) << TICK_LIMIT_SHIFT) |
      ((BigInt(tick.duration) & TICK_DURATION_MASK) << TICK_DURATION_SHIFT) |
      ((BigInt(tick.rate) & TICK_RATE_MASK) << TICK_RATE_SHIFT) |
      ((BigInt(tick.limitType ?? LimitType.Absolute) & TICK_LIMIT_TYPE_MASK) << TICK_LIMIT_TYPE_SHIFT)
    );
  }
}
