import { sum } from '../src';

describe('a test', function () {
  it('tests sum', function () {
    expect(sum(2, 3)).toBe(5);
    expect(sum(2, 3)).not.toBe(4);
  });
});
