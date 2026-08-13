import type { SiteBlueprint } from "../lib/types";

type Props = {
  doc: SiteBlueprint;
  pageIdx: number;
  onSelectPage: (i: number) => void;
  onAddPage: () => void;
  onRenamePage: (idx: number, patch: Partial<Pick<Page, "slug" | "title" | "description">>) => void;
  onDeletePage: (idx: number) => void;
};
import type { Page } from "../lib/types";

export default function PagesManager(p: Props) {
  return (
    <>
      <div className="panel-label">Pages</div>
      {p.doc.pages.map((page, i) => (
        <div
          className={`inspector-section${p.pageIdx === i ? " current" : ""}`}
          key={page.id}
          style={{ borderColor: p.pageIdx === i ? "var(--chrome-accent)" : undefined }}
        >
          <div className="inspector-head">
            <b>{page.title || page.slug || "Untitled"}</b>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => p.onRenamePage(i, {})} title="Rename (inline soon)">
                ✓
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => p.onDeletePage(i)} title="Delete page">
                ×
              </button>
            </div>
          </div>
          <div className="json-field">
            <label>Title</label>
            <input
              value={page.title}
              onChange={(e) => p.onRenamePage(i, { title: e.target.value })}
            />
          </div>
          <div className="json-field">
            <label>URL slug</label>
            <input
              value={page.slug}
              onChange={(e) => p.onRenamePage(i, { slug: e.target.value })}
              placeholder="empty = home"
            />
          </div>
          <div className="json-field">
            <label>Meta description</label>
            <textarea
              rows={2}
              value={page.description}
              onChange={(e) => p.onRenamePage(i, { description: e.target.value })}
            />
          </div>
          <button className="btn btn-sm" style={{ width: "100%" }} onClick={() => p.onSelectPage(i)}>
            View this page
          </button>
        </div>
      ))}

      <button className="btn" style={{ width: "100%", marginTop: 6 }} onClick={p.onAddPage}>
        + Add page
      </button>

      <div className="settings-note" style={{ marginTop: 12 }}>
        Nav links that start with "/slug" automatically switch to the right page in the preview, and
        export to a real <code>.html</code> file.
      </div>
    </>
  );
}
