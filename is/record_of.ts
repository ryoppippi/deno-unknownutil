import { rewriteName } from "../_funcutil.ts";
import type { Predicate } from "../type.ts";
import { isRecord } from "./record.ts";

/**
 * Return a type predicate function that returns `true` if the type of `x` satisfies `Record<K, T>`.
 *
 * To enhance performance, users are advised to cache the return value of this function and mitigate the creation cost.
 *
 * ```ts
 * import { is } from "@core/unknownutil";
 *
 * const isMyType = is.RecordOf(is.Number);
 * const a: unknown = {"a": 0, "b": 1};
 * if (isMyType(a)) {
 *   // a is narrowed to Record<PropertyKey, number>
 *   const _: Record<PropertyKey, number> = a;
 * }
 * ```
 *
 * With predicate function for keys:
 *
 * ```ts
 * import { is } from "@core/unknownutil";
 *
 * const isMyType = is.RecordOf(is.Number, is.String);
 * const a: unknown = {"a": 0, "b": 1};
 * if (isMyType(a)) {
 *   // a is narrowed to Record<string, number>
 *   const _: Record<string, number> = a;
 * }
 * ```
 */
export function isRecordOf<T, K extends PropertyKey = PropertyKey>(
  pred: Predicate<T>,
  predKey?: Predicate<K>,
): Predicate<Record<K, T>> {
  return rewriteName(
    (x: unknown): x is Record<K, T> => {
      if (!isRecord(x)) return false;
      for (const k in x) {
        if (!pred(x[k])) return false;
        if (predKey && !predKey(k)) return false;
      }
      return true;
    },
    "isRecordOf",
    pred,
    predKey,
  );
}
