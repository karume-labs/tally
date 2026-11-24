declare module "bun:test" {
  export interface TestFn<T = unknown> {
    (name: string, fn?: (input: T) => void | Promise<void>): void;
    only(name: string, fn?: (input: T) => void | Promise<void>): void;
    skip(name: string, fn?: (input: T) => void | Promise<void>): void;
  }

  export interface DescribeFn {
    (name: string, fn: () => void): void;
    only(name: string, fn: () => void): void;
    skip(name: string, fn: () => void): void;
  }

  export type Expect = (actual: unknown) => {
    toBe(expected: unknown): void;
    toBeNull(): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toBeLessThanOrEqual(expected: number): void;
    toBeGreaterThan(expected: number): void;
    toBeLessThan(expected: number): void;
    toHaveLength(expected: number): void;
    toContainEqual(expected: unknown): void;
    not: {
      toBe(expected: unknown): void;
      toBeNull(): void;
      toHaveLength(expected: number): void;
      toContainEqual(expected: unknown): void;
      toBeGreaterThanOrEqual(expected: number): void;
      toBeLessThanOrEqual(expected: number): void;
    };
  };

  export const describe: DescribeFn;
  export const test: TestFn;
  export const expect: Expect;
  export const assert: {
    equal<T>(actual: T, expected: T, message?: string): void;
    deepEqual<T>(actual: T, expected: T, message?: string): void;
  };
}
