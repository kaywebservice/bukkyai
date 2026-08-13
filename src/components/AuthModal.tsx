import { useEffect, useState } from "react";
import { authConfigured, deleteAccount, onAuthChange, sendPasswordReset, sendVerificationEmail, signInEmail, signUpEmail, signInGoogle, signInAnonymous, signOut, type AuthUser } from "../lib/auth";

type Props = {
  onClose: () => void;
};

export default function AuthModal(p: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showReset, setShowReset] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authConfigured()) return;
    const unsub = onAuthChange((u) => setUser(u));
    return unsub;
  }, []);

  const run = async (fn: () => Promise<{ user: AuthUser | null; error?: string }>) => {
    setBusy(true);
    setErr(null);
    setNote(null);
    const res = await fn();
    setBusy(false);
    if (res.error) setErr(res.error);
  };

  if (!authConfigured()) {
    return (
      <div className="modal-overlay" onClick={p.onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h2>Authentication</h2>
          <p className="settings-note">
            Firebase isn't configured yet. Add <code>VITE_FIREBASE_API_KEY</code>,{" "}
            <code>VITE_FIREBASE_AUTH_DOMAIN</code>, <code>VITE_FIREBASE_PROJECT_ID</code> and{" "}
            <code>VITE_FIREBASE_APP_ID</code> to a <code>.env</code> file (see{" "}
            <code>.env.example</code>) and restart the dev server.
          </p>
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={p.onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={p.onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{user ? `Signed in as ${user.email ?? "guest"}` : "Sign in"}</h2>

        {user ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {user.photo ? <img src={user.photo} alt="" style={{ width: 48, height: 48, borderRadius: "50%" }} /> : null}
            <div className="settings-note">
              {user.emailVerified === false && user.email ? (
                <span style={{ color: "var(--chrome-warn)", display: "block" }}>
                  Email not verified yet — check your inbox and click the link.
                </span>
              ) : null}
              UID: {user.uid}
            </div>
            {note ? <div className="settings-note" style={{ color: "var(--chrome-good)" }}>{note}</div> : null}
            {err ? <div className="settings-note" style={{ color: "#c0392b" }}>{err}</div> : null}
            <button
              className="btn"
              disabled={busy}
              onClick={async () => {
                const r = await sendVerificationEmail();
                setErr(r.error ?? null);
                setNote(r.ok ? "Verification email sent." : null);
              }}
            >
              Resend verification email
            </button>
            <button
              className="btn"
              disabled={busy}
              onClick={async () => {
                if (!user.email) return;
                const r = await sendPasswordReset(user.email);
                setErr(r.error ?? null);
                setNote(r.ok ? "Password reset email sent." : null);
              }}
            >
              Send password reset email
            </button>
            <button
              className="btn btn-danger"
              disabled={busy}
              onClick={async () => {
                if (!window.confirm("Delete your account permanently? Projects and cloud saves are removed. This cannot be undone.")) return;
                try {
                  const { listCloudProjects, deleteCloudProject } = await import("../lib/cloud");
                  const list = await listCloudProjects(user.uid);
                  for (const cp of list) await deleteCloudProject(user.uid, cp.id);
                } catch {
                  // best-effort cloud cleanup
                }
                const r = await deleteAccount();
                if (r.error) setErr(r.error);
                else setUser(null);
              }}
            >
              Delete account
            </button>
            <button
              className="btn"
              disabled={busy}
              onClick={async () => {
                await signOut();
                setUser(null);
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {err ? <div className="settings-note" style={{ color: "#c0392b" }}>{err}</div> : null}
            <div className="settings-row">
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" />
            </div>
            <div className="settings-row">
              <label>Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} />
            </div>
            <button
              className="btn btn-primary"
              disabled={busy || !email || !password}
              onClick={() => {
                if (mode === "signin") void run(() => signInEmail(email, password));
                else void run(() => signUpEmail(email, password));
              }}
            >
              {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
            <button className="btn" disabled={busy} onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Need an account? Create one" : "Have an account? Sign in"}
            </button>
            {mode === "signin" && !showReset && (
              <button className="btn btn-ghost" disabled={busy} onClick={() => setShowReset(true)}>
                Forgot password?
              </button>
            )}
            {showReset && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, border: "1px solid var(--chrome-border)", borderRadius: 8, padding: 10 }}>
                <label style={{ fontSize: 12 }}>Email</label>
                <input
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="account@example.com"
                />
                <button
                  className="btn btn-sm"
                  disabled={busy || !resetEmail}
                  onClick={async () => {
                    setBusy(true);
                    setErr(null);
                    setNote(null);
                    const r = await sendPasswordReset(resetEmail);
                    setBusy(false);
                    if (r.ok) {
                      setNote("Reset link sent — check your inbox.");
                      setShowReset(false);
                      setResetEmail("");
                    } else setErr(r.error ?? "Could not send reset email.");
                  }}
                >
                  Send reset link
                </button>
              </div>
            )}
            <div className="settings-note">or</div>
            <button className="btn" disabled={busy} onClick={() => void run(signInGoogle)}>
              Continue with Google
            </button>
            <button className="btn" disabled={busy} onClick={() => void run(signInAnonymous)}>
              Continue as guest
            </button>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={p.onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
