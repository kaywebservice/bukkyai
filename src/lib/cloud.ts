// Firestore cloud sync — shared project storage with team roles.
// Requires: Firebase configured (VITE_FIREBASE_*), user signed in, and Firestore
// enabled with rules that allow the shared /projects collection (see firestore.rules).
import type { Checkpoint, SiteBlueprint } from "./types";

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
  role?: "owner" | "editor" | "viewer";
  history?: Checkpoint[];
};

type CloudDoc = {
  ownerId: string;
  name: string;
  at: number;
  doc: SiteBlueprint;
  history?: Checkpoint[];
  members: Record<string, "owner" | "editor" | "viewer">;
  memberUids: string[];
  invites?: Record<string, "editor" | "viewer">;
  inviteEmails?: string[];
};

export async function saveProjectToCloud(uid: string, projectId: string, name: string, doc: SiteBlueprint, history?: Checkpoint[]): Promise<{ ok: boolean; error?: string }> {
  try {
    const db = await getDb();
    const { doc: d, setDoc, getDoc } = await import("firebase/firestore");
    const ref = d(db, "projects", projectId);
    const existing = await getDoc(ref);
    const payload: Record<string, unknown> = {
      name,
      at: Date.now(),
      doc: JSON.parse(JSON.stringify(doc)) as SiteBlueprint,
      ...(history && history.length ? { history: JSON.parse(JSON.stringify(history)) as Checkpoint[] } : {}),
    };
    if (!existing.exists()) {
      payload.ownerId = uid;
      payload.members = { [uid]: "owner" };
      payload.memberUids = [uid];
      payload.invites = {};
      payload.inviteEmails = [];
    }
    await setDoc(ref, payload, { merge: true });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function listCloudProjects(uid: string, email?: string): Promise<{ projects: CloudProject[]; invites: CloudProject[] }> {
  const projects: CloudProject[] = [];
  const invites: CloudProject[] = [];
  try {
    const db = await getDb();
    const { collection, query, where, getDocs } = await import("firebase/firestore");

    const mine = await getDocs(query(collection(db, "projects"), where("memberUids", "array-contains", uid)));
    for (const snap of mine.docs) {
      const d = snap.data() as CloudDoc;
      projects.push({ id: snap.id, name: d.name, at: d.at, doc: d.doc, role: d.members?.[uid] });
    }

    if (email) {
      const invited = await getDocs(query(collection(db, "projects"), where("inviteEmails", "array-contains", email)));
      for (const snap of invited.docs) {
        const d = snap.data() as CloudDoc;
        const role = d.invites?.[email] ?? "viewer";
        invites.push({ id: snap.id, name: d.name, at: d.at, doc: d.doc, role });
      }
    }

    await migrateLegacy(db, uid, projects);
  } catch {
    // rules not enabled / no network — return what we have
  }
  return { projects, invites };
}

async function migrateLegacy(db: import("firebase/firestore").Firestore, uid: string, known: CloudProject[]): Promise<void> {
  try {
    const { collection, query, getDocs, doc, getDoc, setDoc } = await import("firebase/firestore");
    const legacy = await getDocs(query(collection(db, "users", uid, "projects")));
    if (legacy.empty) return;
    const knownIds = new Set(known.map((p) => p.id));
    for (const snap of legacy.docs) {
      const pid = snap.id;
      if (knownIds.has(pid)) continue;
      const d = snap.data() as CloudProject;
      const ref = doc(db, "projects", pid);
      const existing = await getDoc(ref);
      if (existing.exists()) continue;
      await setDoc(ref, {
        ownerId: uid,
        name: d.name,
        at: d.at,
        doc: d.doc,
        members: { [uid]: "owner" },
        memberUids: [uid],
        invites: {},
        inviteEmails: [],
      });
    }
  } catch {
    // ignore — migration is best-effort
  }
}

export async function loadCloudProject(uid: string, projectId: string): Promise<CloudProject | null> {
  try {
    const db = await getDb();
    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "projects", projectId));
    if (!snap.exists()) return null;
    const d = snap.data() as CloudDoc;
    return { id: snap.id, name: d.name, at: d.at, doc: d.doc, role: d.members?.[uid], history: d.history };   } catch {
    return null;
  }
}

export async function deleteCloudProject(uid: string, projectId: string): Promise<void> {
  try {
    const db = await getDb();
    const { doc, getDoc, deleteDoc, updateDoc } = await import("firebase/firestore");
    const ref = doc(db, "projects", projectId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const d = snap.data() as CloudDoc;
    if (d.ownerId === uid) {
      await deleteDoc(ref);
    } else {
      const members = { ...(d.members ?? {}) };
      delete members[uid];
      await updateDoc(ref, {
        members,
        memberUids: (d.memberUids ?? []).filter((x) => x !== uid),
      });
    }
  } catch {
    // ignore
  }
}

export async function shareProject(
  uid: string,
  projectId: string,
  email: string,
  role: "editor" | "viewer"
): Promise<{ ok: boolean; error?: string }> {
  try {
    const db = await getDb();
    const { doc, getDoc, updateDoc } = await import("firebase/firestore");
    const ref = doc(db, "projects", projectId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { ok: false, error: "Project not found in cloud." };
    const d = snap.data() as CloudDoc;
    if (d.ownerId !== uid) return { ok: false, error: "Only the owner can invite collaborators." };
    const invitee = email.trim().toLowerCase();
    if (!invitee) return { ok: false, error: "Enter an email address." };
    const invites = { ...(d.invites ?? {}) };
    invites[invitee] = role;
    const inviteEmails = Array.from(new Set([...(d.inviteEmails ?? []), invitee]));
    await updateDoc(ref, { invites, inviteEmails });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function acceptInvite(uid: string, email: string, projectId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const db = await getDb();
    const { doc, getDoc, updateDoc } = await import("firebase/firestore");
    const ref = doc(db, "projects", projectId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { ok: false, error: "Invite not found." };
    const d = snap.data() as CloudDoc;
    const role = d.invites?.[email] ?? "viewer";
    const members = { ...(d.members ?? {}) };
    members[uid] = role;
    const memberUids = Array.from(new Set([...(d.memberUids ?? []), uid]));
    const invites = { ...(d.invites ?? {}) };
    delete invites[email];
    const inviteEmails = (d.inviteEmails ?? []).filter((x) => x !== email);
    await updateDoc(ref, { members, memberUids, invites, inviteEmails });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
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
    const ref = doc(db, "projects", projectId);
    unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const d = snap.data() as CloudDoc;
        onRemote({ id: snap.id, name: d.name, at: d.at, doc: d.doc, role: d.members?.[uid] });
      }
    });
  });
  return () => {
    cancelled = true;
    unsub?.();
    unsub = null;
  };
}

// ── Presence: "X is editing" live indicators ─────────────────────────
// Presence is stored in a top-level presence/{uid} doc (heartbeat every ~10s).
// Presence docs are queryable by projectId and cleaned up on sign-out.

export type PresenceInfo = { uid: string; name: string; projectId: string; at: number };

export async function updatePresence(uid: string, name: string, projectId: string): Promise<void> {
  try {
    const db = await getDb();
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "presence", uid), { uid, name, projectId, at: Date.now() });
  } catch {
    // ignore
  }
}

export async function clearPresence(uid: string): Promise<void> {
  try {
    const db = await getDb();
    const { doc, deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "presence", uid));
  } catch {
    // ignore
  }
}

export function subscribePresence(
  projectId: string,
  selfUid: string,
  onPresence: (users: PresenceInfo[]) => void
): () => void {
  let unsub: (() => void) | null = null;
  let cancelled = false;
  void getDb().then(async (db) => {
    if (cancelled) return;
    const { collection, query, where, onSnapshot } = await import("firebase/firestore");
    const ref = query(collection(db, "presence"), where("projectId", "==", projectId));
    unsub = onSnapshot(ref, (snap) => {
      const users: PresenceInfo[] = [];
      const now = Date.now();
      for (const s of snap.docs) {
        const d = s.data() as PresenceInfo;
        if (d.uid === selfUid) continue;
        if (now - (d.at ?? 0) > 30000) continue; // stale heartbeats
        users.push(d);
      }
      onPresence(users);
    });
  });
  return () => {
    cancelled = true;
    unsub?.();
    unsub = null;
  };
}
