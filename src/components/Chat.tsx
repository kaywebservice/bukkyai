import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../lib/types";

type Props = {
  messages: ChatMessage[];
  busy: boolean;
  onDiscuss: (msg: string) => void;
  onSendInstruction: (instruction: string) => void;
  onClear: () => void;
};

export default function Chat(p: Props) {
  const [input, setInput] = useState("");
  const [showDiscussion, setShowDiscussion] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [p.messages]);

  const send = () => {
    const text = input.trim();
    if (!text || p.busy) return;
    setInput("");
    p.onSendInstruction(text);
  };

  return (
    <div className="chat-wrap">
      <div className="chat-msgs" ref={transcriptRef}>
        {p.messages.length === 0 ? (
          <div className="settings-note">Ask me to edit anything in this site — or pick a tab on the left to start building.</div>
        ) : (
          p.messages.map((m) => (
            <div key={m.id} className={`msg msg-${m.role}${m.kind ? ` msg-${m.kind}` : ""}`}>
              <div className="msg-bubble">{m.text || (m.role === "assistant" ? "…" : "")}</div>
            </div>
          ))
        )}
        {p.busy && (
          <div className="msg msg-assistant">
            <div className="skeleton-chat" style={{ padding: "10px 13px", background: "var(--chrome-panel2)", border: "1px solid var(--chrome-border)", borderRadius: 12 }}>
              <div className="skeleton skeleton-line" style={{ width: "88%" }} />
              <div className="skeleton skeleton-line" style={{ width: "70%" }} />
              <div className="skeleton skeleton-line short" />
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-wrapper">
        <input
          className="chat-input"
          placeholder="Ask me to edit anything in this site… (e.g. 'make the hero CTA red and bold')"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button className="chat-send" disabled={p.busy || !input.trim()} onClick={send}>
          {p.busy ? "…" : "Send"}
        </button>
        <button
          className={`chat-discuss-toggle ${showDiscussion ? "on" : ""}`}
          title="Open discussion & history"
          onClick={() => setShowDiscussion((v) => !v)}
        />
      </div>

      {showDiscussion && (
        <div className="discussion-panel">
          <div className="panel-label">Discussion</div>
          {p.messages.filter((m) => m.role === "user").length === 0 ? (
            <div className="settings-note">No history yet. Every instruction you send is saved here so you can branch from an earlier point.</div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement)?.value.trim();
                if (q) {
                  p.onDiscuss(q);
                  e.currentTarget.reset();
                }
              }}
              style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, overflow: "hidden" }}
            >
              <ul className="discussion-list" style={{ flex: 1, overflowY: "auto", margin: 0, paddingLeft: 0 }}>
                {p.messages
                  .filter((m) => m.role === "user")
                  .map((m) => (
                    <li key={m.id}>{m.text.slice(0, 140)}{m.text.length > 140 ? "…" : ""}</li>
                  ))}
              </ul>
              <div style={{ display: "flex", gap: 6 }}>
                <input name="q" className="chat-input" placeholder="Ask a question about the site…" />
                <button className="btn btn-sm" type="submit" disabled={p.busy}>
                  Ask
                </button>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={p.onClear}>
                New session
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
