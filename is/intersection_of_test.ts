import { assertEquals } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { assertType } from "@std/testing/types";
import type { Equal } from "../_testutil.ts";
import { is } from "./mod.ts";
import { isIntersectionOf } from "./intersection_of.ts";

Deno.test("isIntersectionOf<T>", async (t) => {
  const objPreds = [
    is.ObjectOf({ a: is.Number }),
    is.ObjectOf({ b: is.String }),
  ] as const;
  const mixPreds = [
    is.Function,
    is.ObjectOf({ b: is.String }),
  ] as const;

  await t.step("returns properly named predicate function", async (t) => {
    assertEquals(typeof isIntersectionOf([is.String]), "function");
    await assertSnapshot(t, isIntersectionOf([is.String]).name);
    await assertSnapshot(t, isIntersectionOf(objPreds).name);
    await assertSnapshot(t, isIntersectionOf(mixPreds).name);
  });

  await t.step("returns true on all of T", () => {
    const f = Object.assign(() => void 0, { b: "a" });
    assertEquals(isIntersectionOf([is.String])("a"), true);
    assertEquals(isIntersectionOf(objPreds)({ a: 0, b: "a" }), true);
    assertEquals(isIntersectionOf(mixPreds)(f), true);
  });

  await t.step("returns false on non of T", () => {
    const f = Object.assign(() => void 0, { b: "a" });
    assertEquals(isIntersectionOf(objPreds)("a"), false);
    assertEquals(isIntersectionOf(mixPreds)({ a: 0, b: "a" }), false);
    assertEquals(isIntersectionOf([is.String])(f), false);
  });

  await t.step("predicated type is correct", () => {
    const a: unknown = undefined;

    if (isIntersectionOf([is.String])(a)) {
      assertType<Equal<typeof a, string>>(true);
    }

    if (isIntersectionOf(objPreds)(a)) {
      assertType<Equal<typeof a, { a: number } & { b: string }>>(true);
    }

    if (isIntersectionOf(mixPreds)(a)) {
      assertType<
        Equal<
          typeof a,
          & ((...args: unknown[]) => unknown)
          & { b: string }
        >
      >(true);
    }
  });

  await t.step("predicated type is correct (#68)", () => {
    const a: unknown = undefined;
    const pred = isIntersectionOf([
      is.ObjectOf({ id: is.String }),
      is.UnionOf([
        is.ObjectOf({ result: is.String }),
        is.ObjectOf({ error: is.String }),
      ]),
    ]);

    if (pred(a)) {
      assertType<
        Equal<
          typeof a,
          { id: string } & ({ result: string } | { error: string })
        >
      >(true);
    }
  });
});
