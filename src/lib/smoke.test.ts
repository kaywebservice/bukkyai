import { expect, test, describe } from "vitest";
import { runSmoke } from "./smoke";
import { harmonizeDesign, scoreDesign, hueHarmony } from "./harmony";
import { DEFAULT_DESIGN } from "./blueprint";
import { parseMarkdown } from "./markdown";
import { compileBrief, EMPTY_BRIEF, BRIEF_FEATURES } from "./brief";describe("site render smoke suite", () => {
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

describe("markdown import", () => {
  test("parses front matter + body into a post", () => {
    const md = `---
title: Launch day
date: 2026-02-01
author: Ada
category: News
excerpt: We shipped.
cover: /img/launch.png
---

## Big news

We shipped **everything** today.
`;
    const post = parseMarkdown(md);
    expect(post).not.toBeNull();
    expect(post!.title).toBe("Launch day");
    expect(post!.author).toBe("Ada");
    expect(post!.category).toBe("News");
    expect(post!.cover).toBe("/img/launch.png");
    expect(post!.content).toContain("<h2>Big news</h2>");
    expect(post!.content).toContain("<strong>everything</strong>");
    expect(post!.date.slice(0, 10)).toBe("2026-02-01");
  });

  test("returns null without a title", () => {
    expect(parseMarkdown("# Just a heading")).toBeNull();
  });
});

describe("brief compiler", () => {
  test("compiles a full brief into structured lines", () => {
    const brief = compileBrief({
      ...EMPTY_BRIEF,
      description: "A bakery in Austin called June & Oak.",
      businessName: "June & Oak",
      city: "Austin, TX",
      features: ["store", "contact"],
      pages: ["about", "blog"],
      onePager: false,
      tone: "friendly",
      goal: "buy",
      domain: ".store",
      theme: { kind: "preset", name: "Cream & Ink", palette: ["#faf6ef", "#1d1b16", "#b3541e"], label: "Cream & Ink" },
    });
    expect(brief).toContain("TASK: A bakery in Austin called June & Oak.");
    expect(brief).toContain("BUSINESS NAME: June & Oak.");
    expect(brief).toContain("SERVICE AREA: Austin, TX.");
    expect(brief).toContain("Store, Contact form");
    expect(brief).toContain("full multi-page site");
    expect(brief).toContain("VOICE & TONE: friendly.");
    expect(brief).toContain("visitors should primarily buy");
    expect(brief).toContain("PREFERRED WEB ADDRESS EXTENSION: .store.");
    expect(brief).toContain("THEME DIRECTION");
  });

  test("feature ids always resolve to a known section label", () => {
    for (const f of BRIEF_FEATURES) {
      expect(f.id.length).toBeGreaterThan(1);
      expect(f.section.length).toBeGreaterThan(1);
    }
  });
});