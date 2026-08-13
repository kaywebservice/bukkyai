import { useEffect, useState } from "react";
import { authConfigured, onAuthChange, signInEmail, signUpEmail, signInGoogle, signInAnonymous, sendPasswordReset, type AuthUser } from "../lib/auth";

type Props = {
  onClose?: () => void;
};

const GUEST_KEY = "bukkyai.guestAccess";

export function guestAccessGranted(): boolean {
  try {
    return localStorage.getItem(GUEST_KEY) === "1";
  } catch {
    return false;
  }
}

export default function AuthGate(p: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [resetEmail, setResetEmail] = useState("");
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
    else setUser(res.user);
  };

  // When signed in (or guest access), auto-dismiss this gate.
  useEffect(() => {
    if (user || guestAccessGranted()) p.onClose?.();
  }, [user, p]);

  const allowGuest = () => {
    try {
      localStorage.setItem(GUEST_KEY, "1");
    } catch {}
    if (authConfigured()) void run(signInAnonymous);
    else p.onClose?.();
  };

  const card = (
    <div className="auth-gate-card">
      <div className="auth-gate-brand">
        <span className="brand-mark">b</span>
        <span>bukkyai</span>
      </div>
      <h1>{user ? "Welcome back" : mode === "signin" ? "Welcome back" : "Create your account"}</h1>
      <p className="auth-gate-sub">
        {user
          ? `Signed in as ${user.email ?? "guest"}`
          : "Sign in or create an account to open the builder. Your projects sync across devices."}
      </p>

      {user ? (
        <div className="auth-gate-user">
          {user.photo ? <img src={user.photo} alt="" /> : <span className="auth-avatar auth-avatar-fallback">{(user.email ?? "g").slice(0, 1).toUpperCase()}</span>}
          <div>
            <b>{user.email ?? "Guest"}</b>
            <span>Ready to build</span>
          </div>
        </div>
      ) : (
        <form
          className="auth-gate-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (mode === "signin") void run(() => signInEmail(email, password));
            else void run(() => signUpEmail(email, password));
          }}
        >
          {err ? <div className="auth-gate-err">{err}</div> : null}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} required />
          <button className="btn btn-primary" type="submit" disabled={busy || !email || !password}>
            {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
          {mode === "signin" && !showReset && (
            <button className="btn btn-ghost" type="button" onClick={() => setShowReset(true)}>
              Forgot password?
            </button>
          )}
          {showReset && (
            <div className="auth-gate-reset">
              <input type="email" placeholder="Account email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
              <button
                className="btn btn-sm"
                type="button"
                disabled={busy || !resetEmail}
                onClick={async () => {
                  setBusy(true);
                  setErr(null);
                  const r = await sendPasswordReset(resetEmail);
                  setBusy(false);
                  if (r.ok) {
                    setNote("Reset link sent — check your inbox.");
                    setShowReset(false);
                  } else setErr(r.error ?? "Could not send reset email.");
                }}
              >
                Send reset link
              </button>
            </div>
          )}
          {note ? <div className="auth-gate-note">{note}</div> : null}
          <button className="btn btn-ghost" type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Need an account? Create one" : "Have an account? Sign in"}
          </button>
        </form>
      )}

      {!user && (
        <div className="auth-gate-divider"><span>or</span></div>
      )}
      {!user && (
        <div className="auth-gate-alt">
          <button className="btn" disabled={busy} onClick={() => void run(signInGoogle)}>
            Continue with Google
          </button>
          {authConfigured() ? (
            <button className="btn btn-ghost" disabled={busy} onClick={allowGuest}>
              Continue as guest
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={allowGuest}>
              Continue without an account
            </button>
          )}
        </div>
      )}

      <p className="auth-gate-foot">
        {p.onClose ? (
          <button className="btn btn-ghost" onClick={() => { window.location.href = "/"; }}>← Back to home</button>
        ) : (
          <span>Designed by Kaywebservice Enterprise Solutions</span>
        )}
      </p>
    </div>
  );

  return (
    <div className="auth-gate">
      <div className="auth-gate-glow" aria-hidden="true" />
      {card}
    </div>
  );
}
