import { useState } from "react";
import { STARTER_SITES } from "../lib/starterSites";

type Props = {
  onPick: (starterId: string | null, name: string) => void;
  onClose: () => void;
};

export default function StarterGallery(p: Props) {
  const [name, setName] = useState("My new site");
  return (
    <div className="modal-overlay" onClick={p.onClose}>
      <div className="modal starter-modal" onClick={(e) => e.stopPropagation()}>
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
      </div>
    </div>
  );
}
