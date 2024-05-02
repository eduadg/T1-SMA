export default class RandomGenerator {
  private limit: number;
  private current: number;
  private count: number = 0;

  constructor(limit: number = 100000, seed: number = 5) {
    this.limit = limit;
    this.current = seed;
  }

  hasNext(): boolean {
    return this.count < this.limit;
  }

  next(): number {
    const modulus = 2 ** 32;
    const multiplier = 1664525;
    const increment = 1013904223;

    this.current = (multiplier * this.current + increment) % modulus;
    ++this.count;
    return this.current / modulus;
  }

  nextInRange(min: number, max: number): number {
    const nextValue = this.next();
    return (max - min) * nextValue + min;
  }
}
