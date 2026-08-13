import { expect, test, describe } from "vitest";
import { runSmoke } from "./smoke";

describe("site render smoke suite", () => {
  test("all render checks pass", () => {
    const res = runSmoke();
    for (const [name, ok] of res.results) {
      if (!ok) console.error(`FAIL  ${name}`);
    }
    expect(res.pass).toBe(res.total);
  });
});