import type { User } from "firebase/auth";

export type AuthUser = {
  uid: string;
  email: string | null;
  name: string | null;
  photo: string | null;
};

function config(): { apiKey: string; authDomain: string; projectId: string; appId: string } | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;
  if (!apiKey || !authDomain || !projectId || !appId) return null;
  return { apiKey, authDomain, projectId, appId };
}

export function authConfigured(): boolean {
  return Boolean(config());
}

let authPromise: Promise<import("firebase/auth").Auth> | null = null;

async function getAuth(): Promise<import("firebase/auth").Auth> {
  const cfg = config();
  if (!cfg) throw new Error("Firebase not configured. Add VITE_FIREBASE_* to your .env.");
  if (!authPromise) {
    authPromise = (async () => {
      const { initializeApp } = await import("firebase/app");
      const { getAuth, setPersistence, browserLocalPersistence } = await import("firebase/auth");
      const app = initializeApp({ apiKey: cfg.apiKey, authDomain: cfg.authDomain, projectId: cfg.projectId, appId: cfg.appId });
      const auth = getAuth(app);
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch {
        // persistence not critical
      }
      return auth;
    })();
  }
  return authPromise;
}

function toAuthUser(u: User | null): AuthUser | null {
  if (!u) return null;
  return {
    uid: u.uid,
    email: u.email,
    name: u.displayName,
    photo: u.photoURL,
  };
}

export async function signInEmail(email: string, password: string): Promise<{ user: AuthUser | null; error?: string }> {
  try {
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    const auth = await getAuth();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { user: toAuthUser(cred.user) };
  } catch (err) {
    return { user: null, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function signUpEmail(email: string, password: string): Promise<{ user: AuthUser | null; error?: string }> {
  try {
    const { createUserWithEmailAndPassword } = await import("firebase/auth");
    const auth = await getAuth();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return { user: toAuthUser(cred.user) };
  } catch (err) {
    return { user: null, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function signInGoogle(): Promise<{ user: AuthUser | null; error?: string }> {
  try {
    const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
    const auth = await getAuth();
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return { user: toAuthUser(cred.user) };
  } catch (err) {
    return { user: null, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function signInAnonymous(): Promise<{ user: AuthUser | null; error?: string }> {
  try {
    const { signInAnonymously } = await import("firebase/auth");
    const auth = await getAuth();
    const cred = await signInAnonymously(auth);
    return { user: toAuthUser(cred.user) };
  } catch (err) {
    return { user: null, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function signOut(): Promise<void> {
  try {
    const auth = await getAuth();
    const { signOut: so } = await import("firebase/auth");
    await so(auth);
  } catch {
    // ignore
  }
}

export function onAuthChange(cb: (user: AuthUser | null) => void): () => void {
  if (!authConfigured()) return () => {};
  let unsub: (() => void) | null = null;
  void getAuth().then((auth) => {
    import("firebase/auth").then(({ onAuthStateChanged }) => {
      unsub = onAuthStateChanged(auth, (u) => cb(toAuthUser(u)));
    });
  });
  return () => {
    unsub?.();
  };
}
