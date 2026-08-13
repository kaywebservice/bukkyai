import { useEffect } from "react";

type Props = {
  onClose: () => void;
};

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "Cmd/Ctrl + K", label: "Open command palette" },
  { keys: "Cmd/Ctrl + S", label: "Checkpoint / save" },
  { keys: "Cmd/Ctrl + Z", label: "Undo" },
  { keys: "Cmd/Ctrl + Shift + Z", label: "Redo" },
  { keys: "E", label: "Toggle edit mode" },
  { keys: "1 / 2 / 3", label: "Switch device (desktop / tablet / mobile)" },
  { keys: "Esc", label: "Close modal / deselect" },
];

export default function ShortcutsModal(p: Props) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") p.onClose();
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [p.onClose]);

  return (
    <div className="modal-overlay" onClick={p.onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="inspector-head">
          <h2 style={{ margin: 0, fontSize: 17 }}>Keyboard shortcuts</h2>
          <button className="btn btn-sm btn-ghost" onClick={p.onClose}>Close</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="shortcut-row">
              <kbd>{s.keys}</kbd>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="settings-note" style={{ marginTop: 14 }}>
          Tip: open the command palette with Cmd/Ctrl+K and type anything — switch tabs, regenerate the
          design, run a command, or jump to a page.
        </div>
      </div>
    </div>
  );
}
