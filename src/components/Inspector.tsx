import { useState } from "react";
import type { Section, SectionContent, SectionMotion, SectionType, SiteBlueprint } from "../lib/types";
import { MOTION_OPTIONS } from "../lib/types";
import { SECTION_LABEL } from "../lib/blueprint";
import type { MediaAsset } from "../lib/store";

type Props = {
  doc: SiteBlueprint;
  pageIdx: number;
  selected: { p: number; s: number };
  onChange: (p: number, s: number, content: SectionContent[SectionType]) => void;
  onMotion: (motion: SectionMotion) => void;
  onRemove: (p: number, s: number) => void;
  onRegenerate: () => void;
  onRewriteField: (fieldPath: string, currentValue: string, context: string) => void;
  onUploadMedia: () => void;
  onGenerateImage: (fieldPath: string) => Promise<string | null>;
  onDuplicate: () => void;
  onCopy: () => void;
  onPaste: () => void;
  hasClipboard: boolean;
  mediaAssets: MediaAsset[];
  onInsertMedia: (dataUrl: string, fieldPath: string) => void;
  busy: boolean;
  busyLabel?: string;
};

type FieldCtx = { sectionType: string; voice: string };
type Obj = Record<string, unknown>;

const ALT_BY_SECTION: Record<string, string> = {
  hero: "Hero image for the site",
  gallery: "Gallery image",
  team: "Team member photo",
  testimonials: "Customer photo",
  products: "Product photo",
  features: "Feature illustration",
  blog: "Blog post cover",
  posts: "Blog post cover",
};

function suggestAlt(sectionType: string): string {
  return ALT_BY_SECTION[sectionType] ?? `${sectionType.replace(/-/g, " ")} image`;
}

function isPlainObject(v: unknown): v is Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

type FEProps = {
  label: string;
  path: string;
  value: unknown;
  onValue: (v: unknown) => void;
  ctx: FieldCtx;
  busy: boolean;
  genBusyPath?: string | null;
  onRewriteField: Props["onRewriteField"];
  onUploadMedia: Props["onUploadMedia"];
  onGenerateImage: Props["onGenerateImage"];
  mediaAssets: MediaAsset[];
  onInsertMedia: Props["onInsertMedia"];
};

function FieldEditor(p: FEProps) {
  const key = p.label.toLowerCase();
  const isImageField = key === "photo" || key === "image" || key === "logo";
  const str = typeof p.value === "string" ? p.value : "";
  const rewriteMeets = typeof p.value === "string" && p.value.length > 20 && p.value.trim() !== "";

  if (Array.isArray(p.value)) {
    if (p.value.length === 0 || typeof p.value[0] === "string") {
      const items = p.value as string[];
      return (
        <div className="json-field">
          <label>{p.label}</label>
          {items.map((item, i) => (
            <div key={i} className="array-item" style={{ display: "flex", gap: 6 }}>
              <input
                value={item}
                onChange={(e) => {
                  const next: string[] = [...items];
                  next[i] = e.target.value;
                  p.onValue(next);
                }}
              />
              <button
                className="rm"
                onClick={() => {
                  const next: string[] = [...items];
                  next.splice(i, 1);
                  p.onValue(next);
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button className="add-btn" onClick={() => p.onValue([...items, ""])}>
            + Add
          </button>
        </div>
      );
    }
    const items = p.value as Obj[];
    const itemKeys = Object.keys(items[0] as Obj);
    return (
      <div className="json-field">
        <label>{p.label}</label>
        {items.map((item, i) => (
          <div key={i} className="array-item">
            <button
              className="rm"
              onClick={() => {
                const next: Obj[] = [...items];
                next.splice(i, 1);
                p.onValue(next);
              }}
            >
              ×
            </button>
            {itemKeys.map((k) => (
              <FieldEditor
                key={k}
                label={k}
                path={`${p.path}[${i}].${k}`}
                value={(item as Obj)[k]}
                onValue={(v) => {
                  const next: Obj[] = [...items];
                  next[i] = { ...next[i], [k]: v };
                  p.onValue(next);
                }}
                ctx={p.ctx}
                busy={p.busy}
                genBusyPath={p.genBusyPath}
                onRewriteField={p.onRewriteField}
                onUploadMedia={p.onUploadMedia}
                onGenerateImage={p.onGenerateImage}
                mediaAssets={p.mediaAssets}
                onInsertMedia={p.onInsertMedia}
              />
            ))}
          </div>
        ))}
        <button
          className="add-btn"
          onClick={() => {
            const template: Obj = {};
            itemKeys.forEach((k) => {
              const base = (items[0] as Obj)[k];
              template[k] = Array.isArray(base) ? [] : typeof base === "string" ? "" : "";
            });
            p.onValue([...items, template]);
          }}
        >
          + Add {p.label}
        </button>
      </div>
    );
  }

  if (isPlainObject(p.value)) {
    const obj = p.value as Obj;
    const keys = Object.keys(obj);
    return (
      <div className="json-field">
        <label>{p.label}</label>
        {keys.map((k) => (
          <FieldEditor
            key={k}
            label={k}
            path={`${p.path}.${k}`}
            value={obj[k]}
            onValue={(v) => p.onValue({ ...obj, [k]: v })}
            ctx={p.ctx}
            busy={p.busy}
            genBusyPath={p.genBusyPath}
            onRewriteField={p.onRewriteField}
            onUploadMedia={p.onUploadMedia}
            onGenerateImage={p.onGenerateImage}
            mediaAssets={p.mediaAssets}
            onInsertMedia={p.onInsertMedia}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="json-field">
      <label>{p.label}</label>
      <div className="field-inline" style={{ gap: 6 }}>
        {(isImageField || key === "url" || key === "href") && str && (
          <button className="btn btn-sm" onClick={p.onUploadMedia} title="Upload / pick image">
            ↑
          </button>
        )}
        {(isImageField || key === "url") && (
          <button
            className="btn btn-sm btn-ghost"
            style={{ padding: "4px 8px", fontSize: 11 }}
            onClick={() => p.onGenerateImage(p.path)}
            disabled={p.genBusyPath === p.path}
            title="Generate image with Gemini AI"
          >
            {p.genBusyPath === p.path ? "…" : "✦"}
          </button>
        )}
        {typeof p.value === "number" ? (
          <input type="number" value={Number(p.value)} onChange={(e) => p.onValue(Number(e.target.value))} />
        ) : (
          <input value={str} onChange={(e) => p.onValue(e.target.value)} />
        )}
        {rewriteMeets && (
          <button
            className="btn btn-sm btn-ghost"
            style={{ padding: "4px 8px", fontSize: 11 }}
            onClick={() => p.onRewriteField(p.path, str, `${p.ctx.sectionType}.${p.label}`)}
            disabled={p.busy}
            title="Rewrite with AI"
          >
            {p.busy ? "…" : "✨"}
          </button>
        )}
        {key === "alt" && !str && (
          <button
            className="btn btn-sm btn-ghost"
            style={{ padding: "4px 8px", fontSize: 11 }}
            onClick={() => p.onValue(suggestAlt(p.ctx.sectionType))}
            title="Suggest alt text"
          >
            Alt+
          </button>
        )}
      </div>
      {(isImageField || key === "url") && p.mediaAssets?.length ? (
        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
          {p.mediaAssets.slice(0, 6).map((a) => (
            <img
              key={a.id}
              src={a.dataUrl}
              alt=""
              style={{ width: 40, height: 40, borderRadius: 6, cursor: "pointer", objectFit: "cover" }}
              onClick={() => p.onInsertMedia(a.dataUrl, p.path)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Inspector(p: Props) {
  const page = p.doc.pages[p.pageIdx];
  const section: Section | undefined = page?.sections[p.selected.s];
  const [genBusy, setGenBusy] = useState<string | null>(null);
  if (!page || !section) {
    return <div className="settings-note">Click a section in the preview (edit mode on) or the left rail to inspect it.</div>;
  }

  const content = section.content as Obj;
  const ctx: FieldCtx = { sectionType: section.type, voice: p.doc.voice ?? "" };

  const apply = (contentNext: Obj) => {
    p.onChange(p.selected.p, p.selected.s, contentNext as SectionContent[SectionType]);
  };

  const insertMedia = (dataUrl: string, fieldPath: string) => {
    const next = { ...content };
    setFieldPath(next, fieldPath, dataUrl);
    apply(next);
  };

  const genImage = async (fieldPath: string): Promise<string | null> => {
    setGenBusy(fieldPath);
    try {
      const dataUrl = await p.onGenerateImage(fieldPath);
      if (dataUrl) {
        insertMedia(dataUrl, fieldPath);
        return dataUrl;
      }
      return null;
    } finally {
      setGenBusy(null);
    }
  };

  return (
    <>
      <div className="inspector-section">
        <div className="inspector-head">
          <b>{SECTION_LABEL[section.type] ?? section.type}</b>
          <button className="btn btn-sm btn-ghost" onClick={() => p.onDuplicate()} title="Duplicate this section">
            Duplicate
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => p.onCopy()} title="Copy this section">
            Copy
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => p.onPaste()} disabled={!p.hasClipboard} title="Paste copied section after this one">
            Paste
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => p.onRemove(p.selected.p, p.selected.s)}>
            Remove
          </button>
        </div>
        <div className="json-field" style={{ marginBottom: 6 }}>
          <label>Motion</label>
          <select
            value={section.motion ?? "none"}
            onChange={(e) => p.onMotion(e.target.value as never)}
          >
            {MOTION_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        {Object.keys(content).map((k) => (
          <FieldEditor
            key={k}
            label={k}
            path={k}
            value={content[k]}
            onValue={(v) => apply({ ...content, [k]: v })}
            ctx={ctx}
            busy={p.busy}
            genBusyPath={genBusy}
            onRewriteField={p.onRewriteField}
            onUploadMedia={p.onUploadMedia}
            onGenerateImage={genImage}
            mediaAssets={p.mediaAssets}
            onInsertMedia={insertMedia}
          />
        ))}
        <button className="btn" style={{ width: "100%" }} onClick={p.onRegenerate} disabled={p.busy}>
          Rewrite this section with AI
        </button>
      </div>
      <div className="settings-note">Free and instant — no credits. Changes are checkpointed so you can always undo.</div>
    </>
  );
}

function setFieldPath(obj: Obj, path: string, value: unknown) {
  const stack = path.split(/[.\[\]]/).filter(Boolean);
  let cur: unknown = obj;
  for (let i = 0; i < stack.length - 1; i++) {
    const k = stack[i];
    const idx = Number(k);
    if (!Number.isNaN(idx)) {
      cur = (cur as unknown[])[idx];
    } else {
      cur = (cur as Obj)[k];
    }
    if (cur === undefined || cur === null) return;
  }
  const last = stack[stack.length - 1];
  const idx = Number(last);
  if (Array.isArray(cur)) {
    if (Number.isNaN(idx)) return;
    cur[idx] = value;
  } else if (isPlainObject(cur)) {
    cur[last] = value;
  }
}
