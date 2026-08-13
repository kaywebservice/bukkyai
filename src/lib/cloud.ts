// Firestore cloud sync — per-user project storage.
// Requires: Firebase configured (VITE_FIREBASE_*), user signed in, and Firestore
// enabled in the Firebase console with rules that restrict access to own uid.
//
// Suggested security rules:
//   rules_version = '2';
//   service cloud.firestore {
//     match /databases/{db}/documents {
//       match /users/{uid}/{document=**} {
//         allow read, write: if request.auth != null && request.auth.uid == uid;
//       }
//     }
//   }
import type { SiteBlueprint } from "./types";

let fsPromise: Promise<import("firebase/firestore").Firestore> | null = null;

async function getDb(): Promise<import("firebase/firestore").Firestore> {
  if (!fsPromise) {
    fsPromise = (async () => {
      const { initializeApp, getApps, getApp } = await import("firebase/app");
      const { getFirestore } = await import("firebase/firestore");
      const app = getApps().length ? getApp() : initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      });
      return getFirestore(app);
    })();
  }
  return fsPromise;
}

export type CloudProject = {
  id: string;
  name: string;
  at: number;
  doc: SiteBlueprint;
};

export async function saveProjectToCloud(uid: string, projectId: string, name: string, doc: SiteBlueprint): Promise<{ ok: boolean; error?: string }> {
  try {
    const db = await getDb();
    const { doc: d, setDoc } = await import("firebase/firestore");
    await setDoc(d(db, "users", uid, "projects", projectId), {
      name,
      at: Date.now(),
      doc: JSON.parse(JSON.stringify(doc)) as SiteBlueprint,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function listCloudProjects(uid: string): Promise<CloudProject[]> {
  try {
    const db = await getDb();
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    const snap = await getDocs(query(collection(db, "users", uid, "projects"), orderBy("at", "desc")));
    return snap.docs.map((d) => d.data() as CloudProject);
  } catch {
    return [];
  }
}

export async function loadCloudProject(uid: string, projectId: string): Promise<CloudProject | null> {
  try {
    const db = await getDb();
    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "users", uid, "projects", projectId));
    if (!snap.exists()) return null;
    return snap.data() as CloudProject;
  } catch {
    return null;
  }
}

export async function deleteCloudProject(uid: string, projectId: string): Promise<void> {
  try {
    const db = await getDb();
    const { doc, deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "users", uid, "projects", projectId));
  } catch {
    // ignore
  }
}

export function subscribeCloudProject(
  uid: string,
  projectId: string,
  onRemote: (cp: CloudProject) => void
): () => void {
  let unsub: (() => void) | null = null;
  let cancelled = false;
  void getDb().then(async (db) => {
    if (cancelled) return;
    const { doc, onSnapshot } = await import("firebase/firestore");
    const ref = doc(db, "users", uid, "projects", projectId);
    unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) onRemote(snap.data() as CloudProject);
    });
  });
  return () => {
    cancelled = true;
    unsub?.();
    unsub = null;
  };
}
