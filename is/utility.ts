import type { UnionToIntersection } from "../_typeutil.ts";
import type { Predicate } from "./type.ts";
import { isUndefined } from "./core.ts";
import { type Optional } from "./factory.ts";
import { inspect } from "../inspect.ts";

type OneOf<T> = T extends readonly [Predicate<infer U>, ...infer R]
  ? U | OneOf<R>
  : never;

/**
 * Return a type predicate function that returns `true` if the type of `x` is `OneOf<T>`.
 *
 * To enhance performance, users are advised to cache the return value of this function and mitigate the creation cost.
 *
 * ```ts
 * import { is } from "https://deno.land/x/unknownutil@$MODULE_VERSION/mod.ts";
 *
 * const isMyType = is.OneOf([is.Number, is.String, is.Boolean]);
 * const a: unknown = 0;
 * if (isMyType(a)) {
 *   // a is narrowed to number | string | boolean
 *   const _: number | string | boolean = a;
 * }
 * ```
 *
 * Depending on the version of TypeScript and how values are provided, it may be necessary to add `as const` to the array
 * used as `preds`. If a type error occurs, try adding `as const` as follows:
 *
 * ```ts
 * import { is } from "https://deno.land/x/unknownutil@$MODULE_VERSION/mod.ts";
 *
 * const preds = [is.Number, is.String, is.Boolean] as const;
 * const isMyType = is.OneOf(preds);
 * const a: unknown = 0;
 * if (isMyType(a)) {
 *   // a is narrowed to number | string | boolean
 *   const _: number | string | boolean = a;
 * }
 * ```
 */
export function isOneOf<
  T extends readonly [Predicate<unknown>, ...Predicate<unknown>[]],
>(
  preds: T,
): Predicate<OneOf<T>> {
  return Object.defineProperties(
    (x: unknown): x is OneOf<T> => preds.some((pred) => pred(x)),
    {
      name: {
        get: () => `isOneOf(${inspect(preds)})`,
      },
    },
  );
}

type AllOf<T> = UnionToIntersection<OneOf<T>>;

/**
 * Return a type predicate function that returns `true` if the type of `x` is `AllOf<T>`.
 *
 * To enhance performance, users are advised to cache the return value of this function and mitigate the creation cost.
 *
 * ```ts
 * import { is } from "https://deno.land/x/unknownutil@$MODULE_VERSION/mod.ts";
 *
 * const isMyType = is.AllOf([
 *   is.ObjectOf({ a: is.Number }),
 *   is.ObjectOf({ b: is.String }),
 * ]);
 * const a: unknown = { a: 0, b: "a" };
 * if (isMyType(a)) {
 *   // a is narrowed to { a: number } & { b: string }
 *   const _: { a: number } & { b: string } = a;
 * }
 * ```
 *
 * Depending on the version of TypeScript and how values are provided, it may be necessary to add `as const` to the array
 * used as `preds`. If a type error occurs, try adding `as const` as follows:
 *
 * ```ts
 * import { is } from "https://deno.land/x/unknownutil@$MODULE_VERSION/mod.ts";
 *
 * const preds = [
 *   is.ObjectOf({ a: is.Number }),
 *   is.ObjectOf({ b: is.String }),
 * ] as const
 * const isMyType = is.AllOf(preds);
 * const a: unknown = { a: 0, b: "a" };
 * if (isMyType(a)) {
 *   // a is narrowed to { a: number } & { b: string }
 *   const _: { a: number } & { b: string } = a;
 * }
 * ```
 */
export function isAllOf<
  T extends readonly [Predicate<unknown>, ...Predicate<unknown>[]],
>(
  preds: T,
): Predicate<AllOf<T>> {
  return Object.defineProperties(
    (x: unknown): x is AllOf<T> => preds.every((pred) => pred(x)),
    {
      name: {
        get: () => `isAllOf(${inspect(preds)})`,
      },
    },
  );
}

/**
 * Return a type predicate function that returns `true` if the type of `x` is `T` or `undefined`.
 *
 * To enhance performance, users are advised to cache the return value of this function and mitigate the creation cost.
 *
 * ```ts
 * import { is } from "https://deno.land/x/unknownutil@$MODULE_VERSION/mod.ts";
 *
 * const isMyType = is.OptionalOf(is.String);
 * const a: unknown = "a";
 * if (isMyType(a)) {
 *   // a is narrowed to string | undefined
 *   const _: string | undefined = a;
 * }
 * ```
 */
export function isOptionalOf<T>(
  pred: Predicate<T>,
): Predicate<T | undefined> & Optional {
  return Object.defineProperties(
    (x: unknown): x is Predicate<T | undefined> => isUndefined(x) || pred(x),
    {
      optional: {
        value: true as const,
      },
      name: {
        get: () => `isOptionalOf(${inspect(pred)})`,
      },
    },
  ) as Predicate<T | undefined> & Optional;
}

export default {
  AllOf: isAllOf,
  OneOf: isOneOf,
  OptionalOf: isOptionalOf,
};
