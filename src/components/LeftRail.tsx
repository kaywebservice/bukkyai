import { useState } from "react";
import type { SiteBlueprint } from "../lib/types";
import { SECTION_LABEL, SECTION_TYPES } from "../lib/blueprint";
import { SECTION_TEMPLATES, templatesFor } from "../lib/templates";

type Props = {
  doc: SiteBlueprint;
  pageIdx: number;
  selected: { p: number; s: number } | null;
  onSelectPage: (i: number) => void;
  onSelectSection: (p: number, s: number) => void;
  onRemoveSection: (p: number, s: number) => void;
  onAddSection: (p: number, type: string) => void;
  onAddSectionTemplate: (p: number, templateId: string) => void;
  onMoveSection: (fromP: number, fromS: number, toP: number, toS: number) => void;
};

export default function LeftRail(p: Props) {
  const [drag, setDrag] = useState<{ p: number; s: number } | null>(null);
  const [over, setOver] = useState<{ p: number; s: number } | null>(null);

  const drop = (pi: number, si: number) => {
    if (drag && (drag.p !== pi || drag.s !== si)) p.onMoveSection(drag.p, drag.s, pi, si);
    setDrag(null);
    setOver(null);
  };

  return (
    <div className="left-rail">
      <div className="rail-title">Pages</div>
      {p.doc.pages.map((page, pi) => (
        <div className="rail-page" key={page.id}>
          <div
            className={`rail-page-head${p.pageIdx === pi ? " active" : ""}`}
            style={over?.p === pi && over.s === -1 ? { outline: "1px dashed var(--chrome-accent)" } : undefined}
            onClick={() => p.onSelectPage(pi)}
            onDragOver={(e) => {
              e.preventDefault();
              if (drag) setOver({ p: pi, s: -1 });
            }}
            onDrop={(e) => {
              e.preventDefault();
              drop(pi, -1);
            }}
          >
            <span style={{ opacity: 0.55 }}>◈</span>
            <span style={{ flex: 1 }}>{page.title || page.slug || "Home"}</span>
            <span
              style={{ opacity: 0.4, fontSize: 11, fontFamily: "ui-monospace,monospace" }}
              title="Page slug"
            >
              /{page.slug || "index"}
            </span>
          </div>
          {p.pageIdx === pi &&
            page.sections.map((sec, si) => (
              <div
                key={`${pi}-${si}`}
                className={`rail-sec${p.selected?.p === pi && p.selected.s === si ? " active" : ""}`}
                style={
                  over?.p === pi && over.s === si
                    ? { outline: "1px dashed var(--chrome-accent)", outlineOffset: -1 }
                    : undefined
                }
                draggable
                onDragStart={() => setDrag({ p: pi, s: si })}
                onDragEnd={() => {
                  setDrag(null);
                  setOver(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (drag) setOver({ p: pi, s: si });
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  drop(pi, si);
                }}
                onClick={() => p.onSelectSection(pi, si)}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ cursor: "grab", opacity: 0.5 }}>⋮⋮</span>
                  {SECTION_LABEL[sec.type] ?? sec.type}
                </span>
                <span
                  className="rail-sec-del"
                  title="Remove section"
                  onClick={(e) => {
                    e.stopPropagation();
                    p.onRemoveSection(pi, si);
                  }}
                >
                  ×
                </span>
              </div>
            ))}
          {p.pageIdx === pi && <AddSectionSelect doc={p.doc} pageIdx={pi} onAdd={p.onAddSection} onAddTemplate={p.onAddSectionTemplate} />}
        </div>
      ))}
      <div className="rail-title">Why Kaywebservice</div>
      <div style={{ fontSize: 11.5, color: "var(--chrome-faint)", lineHeight: 1.55 }}>
        Unlimited edits, no credits. Every AI action is a checkpoint — jump back anytime. Your site is a
        plain JSON document you can export and own forever. Drag sections to reorder or move between pages.
      </div>
    </div>
  );
}

function AddSectionSelect(p: {
  doc: SiteBlueprint;
  pageIdx: number;
  onAdd: (p: number, type: string) => void;
  onAddTemplate: (p: number, templateId: string) => void;
}) {
  const [mode, setMode] = useState<"type" | "template">("type");
  return (
    <div className="add-section" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 4 }}>
        <button
          className="btn btn-sm"
          style={{ flex: 1, ...(mode === "type" ? { borderColor: "var(--chrome-accent)", color: "var(--chrome-accent)" } : {}) }}
          onClick={() => setMode("type")}
        >
          Blank
        </button>
        <button
          className="btn btn-sm"
          style={{ flex: 1, ...(mode === "template" ? { borderColor: "var(--chrome-accent)", color: "var(--chrome-accent)" } : {}) }}
          onClick={() => setMode("template")}
        >
          Template
        </button>
      </div>
      {mode === "type" ? (
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) p.onAdd(p.pageIdx, e.target.value);
          }}
        >
          <option value="" disabled>
            + Add blank section…
          </option>
          {SECTION_TYPES.map((t) => (
            <option key={t.type} value={t.type}>
              {t.label}
            </option>
          ))}
        </select>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div className="panel-label" style={{ display: "none" }}>Recipes</div>
          {SECTION_TEMPLATES.filter((t) => templatesFor(t.type).length).map((t) => (
            <button
              key={t.id}
              className="btn btn-sm btn-ghost"
              style={{ justifyContent: "flex-start", textAlign: "left", width: "100%" }}
              title={t.name}
              onClick={() => p.onAddTemplate(p.pageIdx, t.id)}
            >
              <span style={{ color: "var(--chrome-accent)", fontSize: 11, width: 78, flex: "none" }}>
                {SECTION_LABEL[t.type]}
              </span>
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}