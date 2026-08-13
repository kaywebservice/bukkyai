import type { Checkpoint, ChatMessage, LLMSettings, SiteBlueprint, SitePlan } from "./types";
import { emptyBlueprint, sampleProject, uid } from "./blueprint";
import { compressDataUrl } from "./compressImage";

export type ProjectMeta = { id: string; name: string; at: number };

export type MediaAsset = { id: string; name: string; dataUrl: string; at: number };

const K_SETTINGS = "bukkyai.settings";
const K_PROJECTS = "bukkyai.projects";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — ignore
  }
}

export function loadSettings(): LLMSettings {
  return read<LLMSettings>(K_SETTINGS, {
    provider: "openai",
    apiKey: "",
    model: "",
    baseUrl: "",
  });
}

export function saveSettings(s: LLMSettings): void {
  write(K_SETTINGS, s);
}

export function listProjects(): ProjectMeta[] {
  return read<ProjectMeta[]>(K_PROJECTS, []);
}

export function persistProjectsList(projects: ProjectMeta[]): void {
  write(K_PROJECTS, projects);
}

export function createProject(name: string): { meta: ProjectMeta; doc: SiteBlueprint } {
  const meta: ProjectMeta = { id: uid("prj"), name, at: Date.now() };
  const doc = emptyBlueprint(name);
  const projects = listProjects();
  projects.unshift(meta);
  write(K_PROJECTS, projects);
  persistDoc(meta.id, doc);
  persistHistory(meta.id, []);
  return { meta, doc };
}

export function loadProject(id: string): { meta: ProjectMeta | null; doc: SiteBlueprint; history: Checkpoint[] } {
  const meta = listProjects().find((p) => p.id === id) ?? null;
  const doc = read<SiteBlueprint | null>(`bukkyai.doc.${id}`, null) ?? emptyBlueprint(meta?.name ?? "Untitled site");
  const history = read<Checkpoint[]>(`bukkyai.history.${id}`, []);
  return { meta, doc, history };
}

export function persistDoc(id: string, doc: SiteBlueprint): void {
  write(`bukkyai.doc.${id}`, doc);
}

export function persistHistory(id: string, history: Checkpoint[]): void {
  write(`bukkyai.history.${id}`, history);
}

export function loadChat(id: string): ChatMessage[] {
  return read<ChatMessage[]>(`bukkyai.chat.${id}`, []);
}

export function persistChat(id: string, messages: ChatMessage[]): void {
  write(`bukkyai.chat.${id}`, messages);
}

export function loadPlan(id: string): SitePlan | null {
  return read<SitePlan | null>(`bukkyai.plan.${id}`, null);
}

export function persistPlan(id: string, plan: SitePlan | null): void {
  write(`bukkyai.plan.${id}`, plan);
}

export function deleteProject(id: string): void {
  const projects = listProjects().filter((p) => p.id !== id);
  write(K_PROJECTS, projects);
  try {
    localStorage.removeItem(`bukkyai.doc.${id}`);
    localStorage.removeItem(`bukkyai.history.${id}`);
    localStorage.removeItem(`bukkyai.chat.${id}`);
    localStorage.removeItem(`bukkyai.plan.${id}`);
    localStorage.removeItem(`bukkyai.assets.${id}`);
  } catch {
    // ignore
  }
}

export function renameProject(id: string, name: string): void {
  const projects = listProjects().map((p) => (p.id === id ? { ...p, name } : p));
  write(K_PROJECTS, projects);
}

export function demoProject(): { meta: ProjectMeta; doc: SiteBlueprint } {
  const meta: ProjectMeta = { id: uid("prj"), name: "Northwind Coffee (demo)", at: Date.now() };
  const doc = sampleProject();
  persistDoc(meta.id, doc);
  persistHistory(meta.id, []);
  const projects = listProjects();
  projects.unshift(meta);
  write(K_PROJECTS, projects);
  return { meta, doc };
}

export function loadAssets(projectId: string): MediaAsset[] {
  return read<MediaAsset[]>(`bukkyai.assets.${projectId}`, []);
}

export function addAsset(projectId: string, file: File): Promise<MediaAsset | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        void compressDataUrl(String(reader.result ?? ""))
          .catch(() => String(reader.result ?? ""))
          .then(async (compressed) => {
            let dataUrl = compressed;
            const { uploadImageToHost } = await import("./publish");
            const hosted = await uploadImageToHost(compressed);
            if (hosted.url) dataUrl = hosted.url;
            const asset: MediaAsset = {
              id: uid("ast"),
              name: file.name,
              dataUrl,
              at: Date.now(),
            };
            const assets = loadAssets(projectId);
            assets.unshift(asset);
            write(`bukkyai.assets.${projectId}`, assets);
            resolve(asset);
          });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
}

export function addAssetDataUrl(projectId: string, name: string, dataUrl: string): MediaAsset {
  const asset: MediaAsset = { id: uid("ast"), name, dataUrl, at: Date.now() };
  const assets = loadAssets(projectId);
  assets.unshift(asset);
  write(`bukkyai.assets.${projectId}`, assets);
  return asset;
}

export function removeAsset(projectId: string, id: string): void {
  write(
    `bukkyai.assets.${projectId}`,
    loadAssets(projectId).filter((a) => a.id !== id)
  );
}

export function saveProjectAs(doc: SiteBlueprint, name: string): string {
  const id = uid("prj");
  const meta: ProjectMeta = { id, name, at: Date.now() };
  persistDoc(id, doc);
  persistHistory(id, []);
  const projects = listProjects();
  projects.unshift(meta);
  write(K_PROJECTS, projects);
  return id;
}

export function importProjectFromJson(json: string): { meta: ProjectMeta; doc: SiteBlueprint } | { error: string } {  try {
    const parsed = JSON.parse(json) as SiteBlueprint;
    if (!parsed.meta || !parsed.design || !Array.isArray(parsed.pages)) {
      return { error: "Not a valid bukkyai blueprint. Expected meta, design, and pages." };
    }
    const name = parsed.meta.title || "Imported site";
    const meta: ProjectMeta = { id: uid("prj"), name, at: Date.now() };
    persistDoc(meta.id, parsed);
    persistHistory(meta.id, []);
    const projects = listProjects();
    projects.unshift(meta);
    write(K_PROJECTS, projects);
    return { meta, doc: parsed };
  } catch {
    return { error: "Could not parse the JSON file." };
  }
}
