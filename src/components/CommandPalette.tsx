import { useEffect, useRef, useState } from "react";

type Action = { category: string; label: string; onRun: () => void };

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectSection: (p: number, s: number) => void;
  actions: Action[];
};

export default function CommandPalette(p: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (p.open) {
      inputRef.current?.focus();
      const esc = (e: KeyboardEvent) => {
        if (e.key === "Escape") p.onClose();
      };
      document.addEventListener("keydown", esc);
      return () => document.removeEventListener("keydown", esc);
    }
  }, [p.open]);

  const filtered = query
    ? p.actions.filter((a) => `${a.category} ${a.label}`.toLowerCase().includes(query.toLowerCase()))
    : p.actions;

  if (!p.open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: 480, padding: 12 }} onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="chat-input"
          style={{ marginBottom: 10 }}
          placeholder="Type a command… (e.g. 'new', 'export', 'undo')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 420, overflowY: "auto" }}>
          {filtered.map((a, i) => (
            <button
              key={i}
              className="btn"
              style={{ justifyContent: "flex-start" }}
              onClick={() => {
                a.onRun();
                p.onClose();
              }}
            >
              <span style={{ color: "var(--chrome-faint)", width: 110, fontSize: 12 }}>{a.category}</span>
              {a.label}
            </button>
          ))}
        </div>
        <div className="settings-note" style={{ marginTop: 8 }}>
          Tip: Cmd/Ctrl+K anytime. Type to filter. Enter to run.
        </div>
      </div>
    </div>
  );
}
