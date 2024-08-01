import { assertEquals } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { assertType } from "@std/testing/types";
import { type Equal, testWithExamples } from "../_testutil.ts";
import type { PredicateType } from "../type.ts";
import { is } from "./mod.ts";
import { isUnionOf } from "./union_of.ts";

Deno.test("isUnionOf<T>", async (t) => {
  await t.step("returns properly named function", async (t) => {
    await assertSnapshot(t, isUnionOf([is.Number, is.String, is.Boolean]).name);
  });
  await t.step("returns proper type predicate", () => {
    const preds = [is.Number, is.String, is.Boolean] as const;
    const a: unknown = [0, "a", true];
    if (isUnionOf(preds)(a)) {
      assertType<Equal<typeof a, number | string | boolean>>(true);
    }
  });
  await t.step("returns proper type predicate (#49)", () => {
    const isFoo = is.ObjectOf({ foo: is.String });
    const isBar = is.ObjectOf({ foo: is.String, bar: is.Number });
    type Foo = PredicateType<typeof isFoo>;
    type Bar = PredicateType<typeof isBar>;
    const preds = [isFoo, isBar] as const;
    const a: unknown = [0, "a", true];
    if (isUnionOf(preds)(a)) {
      assertType<Equal<typeof a, Foo | Bar>>(true);
    }
  });
  await t.step("returns true on one of T", () => {
    const preds = [is.Number, is.String, is.Boolean] as const;
    assertEquals(isUnionOf(preds)(0), true);
    assertEquals(isUnionOf(preds)("a"), true);
    assertEquals(isUnionOf(preds)(true), true);
  });
  await t.step("returns false on non of T", async (t) => {
    const preds = [is.Number, is.String, is.Boolean] as const;
    await testWithExamples(t, isUnionOf(preds), {
      excludeExamples: ["number", "string", "boolean"],
    });
  });
});
