import { assertEquals } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { assertType } from "@std/testing/types";
import type { Equal } from "../_testutil.ts";
import { is } from "./mod.ts";
import { isTupleOf } from "./tuple_of.ts";

Deno.test("isTupleOf<T>", async (t) => {
  await t.step("returns properly named predicate function", async (t) => {
    await assertSnapshot(
      t,
      isTupleOf([is.Number, is.String, is.Boolean]).name,
    );
    await assertSnapshot(
      t,
      isTupleOf([(_x): _x is string => false]).name,
    );
    await assertSnapshot(
      t,
      isTupleOf([isTupleOf([isTupleOf([is.Number, is.String, is.Boolean])])])
        .name,
    );
  });

  await t.step("returns true on T tuple", () => {
    const predTup = [is.Number, is.String, is.Boolean] as const;
    assertEquals(isTupleOf(predTup)([0, "a", true]), true);
  });

  await t.step("returns false on non T tuple", () => {
    const predTup = [is.Number, is.String, is.Boolean] as const;
    assertEquals(isTupleOf(predTup)([0, 1, 2]), false);
    assertEquals(isTupleOf(predTup)([0, "a"]), false);
    assertEquals(isTupleOf(predTup)([0, "a", true, 0]), false);
  });

  await t.step("predicated type is correct", () => {
    const predTup = [is.Number, is.String, is.Boolean] as const;
    const a: unknown = [0, "a", true];
    if (isTupleOf(predTup)(a)) {
      assertType<Equal<typeof a, [number, string, boolean]>>(true);
    }
  });
});

Deno.test("isTupleOf<T, E>", async (t) => {
  await t.step("returns properly named predicate function", async (t) => {
    await assertSnapshot(
      t,
      isTupleOf([is.Number, is.String, is.Boolean], is.Array).name,
    );
    await assertSnapshot(
      t,
      isTupleOf([(_x): _x is string => false], is.ArrayOf(is.String))
        .name,
    );
    await assertSnapshot(
      t,
      isTupleOf([
        isTupleOf(
          [isTupleOf([is.Number, is.String, is.Boolean], is.Array)],
          is.Array,
        ),
      ]).name,
    );
  });

  await t.step("returns true on T tuple", () => {
    const predTup = [is.Number, is.String, is.Boolean] as const;
    const predElse = is.ArrayOf(is.Number);
    assertEquals(isTupleOf(predTup, predElse)([0, "a", true, 0, 1, 2]), true);
  });

  await t.step("returns false on non T tuple", () => {
    const predTup = [is.Number, is.String, is.Boolean] as const;
    const predElse = is.ArrayOf(is.String);
    assertEquals(isTupleOf(predTup, predElse)([0, 1, 2, 0, 1, 2]), false);
    assertEquals(isTupleOf(predTup, predElse)([0, "a", 0, 1, 2]), false);
    assertEquals(
      isTupleOf(predTup, predElse)([0, "a", true, 0, 0, 1, 2]),
      false,
    );
    assertEquals(isTupleOf(predTup, predElse)([0, "a", true, 0, 1, 2]), false);
  });

  await t.step("predicated type is correct", () => {
    const predTup = [is.Number, is.String, is.Boolean] as const;
    const predElse = is.ArrayOf(is.Number);
    const a: unknown = [0, "a", true, 0, 1, 2];
    if (isTupleOf(predTup, predElse)(a)) {
      assertType<Equal<typeof a, [number, string, boolean, ...number[]]>>(
        true,
      );
    }
  });
});
