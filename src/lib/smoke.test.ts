import { expect, test, describe } from "vitest";
import { runSmoke } from "./smoke";
import { harmonizeDesign, scoreDesign, hueHarmony } from "./harmony";
import { DEFAULT_DESIGN } from "./blueprint";

describe("site render smoke suite", () => {
  test("all render checks pass", () => {
    const res = runSmoke();
    for (const [name, ok] of res.results) {
      if (!ok) console.error(`FAIL  ${name}`);
    }
    expect(res.pass).toBe(res.total);
  });
});

describe("design harmony engine", () => {
  test("hue harmony peaks at complementary angle", () => {
    expect(hueHarmony(180)).toBe(1);
    expect(hueHarmony(90)).toBeLessThan(hueHarmony(150));
    expect(hueHarmony(0)).toBeGreaterThan(0.7);
  });

  test("default design scores and harmonizing does not lower it", () => {
    const base = scoreDesign(DEFAULT_DESIGN);
    expect(base.total).toBeGreaterThan(0);
    expect(base.total).toBeLessThanOrEqual(100);
    const res = harmonizeDesign(DEFAULT_DESIGN);
    expect(res.after.total).toBeGreaterThanOrEqual(res.before.total);
    expect(res.design.tokens.colors.accent).toBeTruthy();
    expect(res.design.tokens.fonts.heading).toBeTruthy();
  });

  test("harmonize fixes an off-curation font pair", () => {
    const broken = {
      ...DEFAULT_DESIGN,
      tokens: {
        ...DEFAULT_DESIGN.tokens,
        fonts: { heading: "Not A Real Font", body: "Not A Real Font" },
      },
    };
    const res = harmonizeDesign(broken);
    expect(res.changes.some((c) => c.includes("curated"))).toBe(true);
    expect(res.design.tokens.fonts.heading).not.toBe("Not A Real Font");
  });
});