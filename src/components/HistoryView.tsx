import type { Checkpoint } from "../lib/types";

const SOURCE_LABEL: Record<string, string> = {
  init: "Created",
  plan: "Planned",
  design: "Design",
  content: "Content",
  edit: "AI edit",
  manual: "Manual edit",
};

const SOURCE_COLOR: Record<string, string> = {
  init: "#6b6b77",
  plan: "#8b7bff",
  design: "#ff6b4a",
  content: "#8b7bff",
  edit: "#8b7bff",
  manual: "#4ade80",
};

type Props = {
  history: Checkpoint[];
  cursor: number;
  onRestore: (idx: number) => void;
  cloudHistory?: Checkpoint[];
  onRestoreCloud?: (cp: Checkpoint) => void;
};

export default function HistoryView(p: Props) {
  const time = (ms: number) =>
    new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <div className="settings-note">
        Every change — AI or manual — is a checkpoint. Click any entry to time-travel back to it.
        Nothing is ever lost.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {p.history.map((h, i) => {
          const isCurrent = i === p.cursor;
          const isPast = i < p.cursor;
          return (
            <div
              key={h.id}
              className={`history-item${isCurrent ? " current" : ""}`}
              style={{ opacity: isPast && !isCurrent ? 0.55 : 1 }}
              onClick={() => p.onRestore(i)}
            >
              <span
                className="history-dot"
                style={{ background: SOURCE_COLOR[h.source] ?? "#6b6b77" }}
              />
              <div className="history-main">
                <div className="history-label">{h.label}</div>
                <div className="history-meta">{SOURCE_LABEL[h.source] ?? h.source}</div>
              </div>
              <span className="history-time">{time(h.at)}</span>
            </div>
          );
        })}
        {p.history.length === 0 && (
          <div className="settings-note">No checkpoints yet.</div>
        )}
      </div>

      {p.cloudHistory && p.cloudHistory.length > 0 && (
        <>
          <div className="panel-label" style={{ marginTop: 16 }}>
            Cloud history
          </div>
          <div className="settings-note">
            Versions synced to your account from any device. Restore one to continue from it.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {p.cloudHistory.map((h) => (
              <div key={h.id} className="history-item" onClick={() => p.onRestoreCloud?.(h)}>
                <span className="history-dot" style={{ background: "#8b7bff" }} />
                <div className="history-main">
                  <div className="history-label">{h.label}</div>
                  <div className="history-meta">Cloud · {SOURCE_LABEL[h.source] ?? h.source}</div>
                </div>
                <span className="history-time">{time(h.at)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
