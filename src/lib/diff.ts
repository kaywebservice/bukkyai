export type DiffLine = {
  type: "same" | "add" | "del";
  a?: number;
  b?: number;
  text: string;
};

export function diffLines(aText: string, bText: string): DiffLine[] {
  const a = aText.split("\n");
  const b = bText.split("\n");
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ type: "same", a: i, b: j, text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "del", a: i, text: a[i] });
      i++;
    } else {
      out.push({ type: "add", b: j, text: b[j] });
      j++;
    }
  }
  while (i < a.length) {
    out.push({ type: "del", a: i, text: a[i] });
    i++;
  }
  while (j < b.length) {
    out.push({ type: "add", b: j, text: b[j] });
    j++;
  }
  return out;
}

export function diffCheckpoints(aJson: string, bJson: string, maxLines = 400): DiffLine[] {
  const lines = diffLines(aJson, bJson);
  const changed = lines.filter((l) => l.type !== "same");
  if (changed.length > maxLines) {
    const head = lines.filter((l) => l.type !== "same").slice(0, maxLines);
    return [...head, { type: "add", text: `… ${changed.length - maxLines} more changed lines truncated` }];
  }
  return lines;
}