import { useState } from "react";
import { useFocusTrap } from "../lib/useFocusTrap";

type Props = {
  projectName: string;
  onShare: (email: string, role: "editor" | "viewer") => Promise<{ ok: boolean; error?: string }>;
  onClose: () => void;
};

export default function ShareModal(p: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [status, setStatus] = useState("");
  const modalRef = useFocusTrap(true, p.onClose);

  const submit = async () => {
    const res = await p.onShare(email, role);
    if (res.ok) {
      setStatus(`Invite sent to ${email.trim()} as ${role}.`);
      setEmail("");
    } else {
      setStatus(res.error ?? "Could not send invite.");
    }
  };

  return (
    <div className="modal-overlay" onClick={p.onClose}>
      <div className="modal" ref={modalRef} role="dialog" aria-modal="true" aria-label="Share project" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <h2>Share project</h2>
        <div className="settings-note" style={{ marginBottom: 12 }}>
          Invite a collaborator to “{p.projectName}”. They'll see it in their project list when they sign in
          with the same email and accept the invite.
        </div>
        <div className="settings-row">
          <label>Email</label>
          <input value={email} placeholder="collaborator@email.com" onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="settings-row">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as "editor" | "viewer")}>
            <option value="editor">Editor — can view and edit</option>
            <option value="viewer">Viewer — can view only</option>
          </select>
        </div>
        {status && <div className="settings-note" style={{ color: "var(--chrome-good, #4ade80)" }}>{status}</div>}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={p.onClose}>Close</button>
          <button className="btn btn-primary" onClick={submit}>Send invite</button>
        </div>
      </div>
    </div>
  );
}
