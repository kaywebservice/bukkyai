import { useState } from "react";
import type { SiteBlueprint } from "../lib/types";

type Props = {
  doc: SiteBlueprint;
  onApply: (doc: SiteBlueprint, count: number) => void;
  onClose: () => void;
};

function replaceInValue(value: unknown, find: string, replace: string): unknown {
  if (typeof value === "string") {
    if (!value.includes(find)) return value;
    const next = value.split(find).join(replace);
    return next;
  }
  if (Array.isArray(value)) return value.map((v) => replaceInValue(v, find, replace));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = replaceInValue(v, find, replace);
    return out;
  }
  return value;
}

export default function FindReplaceModal(p: Props) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");

  const preview = (): number => {
    if (!find) return 0;
    const count = JSON.stringify(p.doc).split(find).length - 1;
    return count;
  };

  const apply = () => {
    if (!find || find === replace) return;
    const before = JSON.stringify(p.doc);
    const nextDoc = { ...p.doc, pages: p.doc.pages.map((pg) => ({ ...pg, sections: pg.sections.map((s) => ({ ...s, content: replaceInValue(s.content, find, replace) })) })) } as SiteBlueprint;
    const count = before.split(find).length - 1;
    p.onApply(nextDoc, count);
    p.onClose();
  };

  return (
    <div className="modal-overlay" onClick={p.onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="inspector-head">
          <h2 style={{ margin: 0, fontSize: 17 }}>Find & replace</h2>
          <button className="btn btn-sm btn-ghost" onClick={p.onClose}>Close</button>
        </div>
        <div className="json-field">
          <label>Find</label>
          <input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Old company name…" autoFocus />
        </div>
        <div className="json-field">
          <label>Replace with</label>
          <input value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="New company name…" />
        </div>
        <div className="settings-note" style={{ marginBottom: 12 }}>
          {find ? `${preview()} occurrence${preview() === 1 ? "" : "s"} across all pages. Applies to every text field, image alt, and link.` : "Type something to search across every page."}
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={p.onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!find || find === replace} onClick={apply}>
            Replace all
          </button>
        </div>
      </div>
    </div>
  );
}
