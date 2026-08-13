import { useState } from "react";
import type { MediaAsset } from "../lib/store";

type Props = {
  assets: MediaAsset[];
  onUpload: (file: File) => void;
  onSelect: (asset: MediaAsset) => void;
  onDelete: (id: string) => void;
  onInsert: (asset: MediaAsset) => void;
  onGenerate: () => Promise<void>;
  busy?: boolean;
};

export default function MediaView(p: Props) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const visible = query ? p.assets.filter((a) => a.name.toLowerCase().includes(query)) : p.assets;
  return (
    <>
      <div className="panel-label">Media library</div>
      <div style={{ display: "flex", gap: 6 }}>
        <label className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
          ↑ Upload image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) p.onUpload(f);
            }}
          />
        </label>
        <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={p.onGenerate} disabled={p.busy}>
          {p.busy ? "…" : "✦ Generate with AI"}
        </button>
      </div>

      {p.assets.length > 1 && (
        <input
          className="chat-input"
          style={{ width: "100%", marginTop: 8, minHeight: 36 }}
          placeholder="Search images…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      )}

      {!p.assets.length ? (
        <div className="settings-note">No images uploaded yet. Drag one in via the upload button, or pick a
          hero/gallery image by rewriting that section with AI.</div>
      ) : visible.length === 0 ? (
        <div className="settings-note" style={{ marginTop: 8 }}>No images match “{q}”.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
            gap: 10,
            marginTop: 8,
          }}
        >
          {visible.map((a) => (
            <div key={a.id} className="inspector-section" style={{ padding: 8 }}>
              <img
                src={a.dataUrl}
                alt={a.name}
                style={{ width: "100%", borderRadius: 8, aspectRatio: "1/1", objectFit: "cover", cursor: "pointer" }}
                onClick={() => p.onSelect(a)}
              />
              <div
                style={{ fontSize: 11, color: "var(--chrome-faint)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                title={a.name}
              >
                {a.name}
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => p.onInsert(a)}>
                  Insert
                </button>
                <button className="btn btn-sm" onClick={() => p.onDelete(a.id)}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

