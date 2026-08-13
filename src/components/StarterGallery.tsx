import { useState } from "react";
import { STARTER_SITES } from "../lib/starterSites";
import { FULL_TEMPLATES } from "../lib/templatesFull";
import { useFocusTrap } from "../lib/useFocusTrap";

type Props = {
  onPick: (starterId: string | null, name: string) => void;
  onClose: () => void;
};

const CATEGORIES = ["All", ...Array.from(new Set(FULL_TEMPLATES.map((t) => t.category)))];

export default function StarterGallery(p: Props) {
  const [name, setName] = useState("My new site");
  const [category, setCategory] = useState("All");
  const [showFull, setShowFull] = useState(false);
  const modalRef = useFocusTrap(true, p.onClose);
  const visible = category === "All" ? FULL_TEMPLATES : FULL_TEMPLATES.filter((t) => t.category === category);
  return (
    <div className="modal-overlay" onClick={p.onClose}>
      <div className="modal starter-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label="New site" onClick={(e) => e.stopPropagation()}>
        <div className="inspector-head">
          <h2 style={{ margin: 0, fontSize: 17 }}>New site</h2>
          <button className="btn btn-sm btn-ghost" onClick={p.onClose}>
            Close
          </button>
        </div>
        <div className="settings-row">
          <label>Project name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My new site" />
        </div>
        <div className="starter-toggle">
          <button className={`btn btn-sm${!showFull ? " btn-primary" : ""}`} onClick={() => setShowFull(false)}>
            Quick starts
          </button>
          <button className={`btn btn-sm${showFull ? " btn-primary" : ""}`} onClick={() => setShowFull(true)}>
            Full templates
          </button>
        </div>

        {!showFull && (
          <>
            <div className="panel-label">Start from a template</div>
            <div className="starter-grid">
              <button className="starter-card" onClick={() => p.onPick(null, name.trim() || "My new site")}>
                <div className="starter-thumb starter-blank">+</div>
                <b>Blank site</b>
                <span>Start from scratch</span>
              </button>
              {STARTER_SITES.map((s) => (
                <button key={s.id} className="starter-card" onClick={() => p.onPick(s.id, name.trim() || s.name)}>
                  <div className="starter-thumb">{s.name.slice(0, 2).toUpperCase()}</div>
                  <b>{s.name}</b>
                  <span>{s.tagline}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {showFull && (
          <>
            <div className="panel-label">Full templates</div>
            <div className="starter-cats">
              {CATEGORIES.map((c) => (
                <button key={c} className={`starter-cat${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="starter-grid">
              <button className="starter-card" onClick={() => p.onPick(null, name.trim() || "My new site")}>
                <div className="starter-thumb starter-blank">+</div>
                <b>Blank site</b>
                <span>Start from scratch</span>
              </button>
              {visible.map((s) => (
                <button key={s.id} className="starter-card" onClick={() => p.onPick(s.id, name.trim() || s.name)}>
                  <div className="starter-thumb starter-full">{s.name.slice(0, 2).toUpperCase()}</div>
                  <b>{s.name}</b>
                  <span>{s.tagline}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

