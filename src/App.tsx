import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ChatMessage,
  Checkpoint,
  DesignSystem,
  LLMSettings,
  Page,
  SectionContent,
  SectionMotion,
  SectionType,
  SiteBlueprint,
  SitePlan,
} from "./lib/types";
import {
  checkpoint,
  emptyBlueprint,
  emptyContent,
  SECTION_LABEL,
  SECTION_TYPES,
  setField,
  uid,
} from "./lib/blueprint";
import { SECTION_TEMPLATES } from "./lib/templates";
import {
  applyEdit,
  buildFromBrief,
  fieldRewrite,
  generateDesign,
  generatePlan,
  generateBlogPosts,
  regenerateSection,
  toneRewrite,
  translateSite,
} from "./lib/builder";
import { DESIGN_PRESETS } from "./lib/presets";
import { streamLLM } from "./lib/llm";
import { DISCUSS_SYSTEM, discussUser } from "./lib/prompts";
import { fillAltText } from "./lib/audit";
import { harmonizeDesign as harmonize } from "./lib/harmony";
import { generateOgImage as renderOgImage } from "./lib/ogImage";
import { canGenerateImages, generateSiteImage } from "./lib/images";
import { authConfigured, onAuthChange } from "./lib/auth";
import AuthGate from "./components/AuthGate";
import { acceptInvite, clearPresence, deleteCloudProject, listCloudProjects, loadCloudProject, saveProjectToCloud, shareProject, subscribeCloudProject, subscribePresence, updatePresence, type PresenceInfo } from "./lib/cloud";
import { fetchEntitlement, fetchEntitlementDetail, proUnlocked, publishSite, setProUnlocked, startProCheckout } from "./lib/publish";
import {
  addAsset,
  addAssetDataUrl,
  createProject,
  deleteProject,
  demoProject,
  importProjectFromJson,
  saveProjectAs,
  listProjects,
  loadAssets,
  loadChat,
  loadPlan,
  loadProject,
  loadSettings,
  persistChat,
  persistDoc,
  persistHistory,
  persistPlan,
  persistProjectsList,
  removeAsset,
  renameProject,
  saveSettings,
  type ProjectMeta,
} from "./lib/store";
import {
  backupToGithub,
  deployToGithubPages,
  downloadBlueprintJson,
  downloadCmsExport,
  downloadReactProject,
  downloadSingleFile,
  downloadStaticZip,
  printBlueprint,
  publishPreview,
} from "./lib/export";
import Header from "./components/Header";
import LeftRail from "./components/LeftRail";
import Preview from "./components/Preview";
import Chat from "./components/Chat";
import DesignPanel from "./components/DesignPanel";
import CodeView from "./components/CodeView";
import MediaView from "./components/MediaView";
import Inspector from "./components/Inspector";
import CommandPalette from "./components/CommandPalette";
import PlanView from "./components/PlanView";
import HistoryView from "./components/HistoryView";
import SettingsModal from "./components/SettingsModal";
import PostsView from "./components/PostsView";
import LanguagesView from "./components/LanguagesView";
import PagesManager from "./components/PagesManager";
import SeoPanel from "./components/SeoPanel";
import AnalyticsView from "./components/AnalyticsView";
import AuthModal from "./components/AuthModal";
import BriefScreen from "./components/BriefScreen";
import StarterGallery from "./components/StarterGallery";
import ShareModal from "./components/ShareModal";
import FindReplaceModal from "./components/FindReplaceModal";
import ShortcutsModal from "./components/ShortcutsModal";
import ThemeGallery from "./components/ThemeGallery";
import VariantsModal from "./components/VariantsModal";
import OnboardingTour, { tourCanShow, tourTurnedOff, markTourShown, turnOffTour, type TourStep } from "./components/OnboardingTour";
import PricingModal from "./components/PricingModal";
import ReferralModal from "./components/ReferralModal";
import FullView from "./components/FullView";
import { starterById } from "./lib/starterSites";
import { fullTemplateById } from "./lib/templatesFull";
import type { GeneratedTheme } from "./lib/themeEngine";

type Tab = "chat" | "design" | "media" | "code" | "inspect" | "plan" | "history" | "posts" | "langs" | "pages" | "seo" | "analytics";

export default function App() {
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [doc, setDoc] = useState<SiteBlueprint | null>(null);
  const [history, setHistory] = useState<Checkpoint[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [invites, setInvites] = useState<{ id: string; name: string; role: string }[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [themesOpen, setThemesOpen] = useState(false);
  const [variantsOpen, setVariantsOpen] = useState(false);
  const [cloudHistory, setCloudHistory] = useState<Checkpoint[]>([]);
  const [presence, setPresence] = useState<PresenceInfo[]>([]);
  const [pro, setPro] = useState(() => proUnlocked());
  const [proTier, setProTier] = useState<"pro" | "plus" | undefined>(undefined);
  const [pageIdx, setPageIdx] = useState(0);
  const [selected, setSelected] = useState<{ p: number; s: number } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [tab, setTab] = useState<Tab>("chat");
  const [settings, setSettings] = useState<LLMSettings & { githubToken?: string }>(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [plan, setPlan] = useState<SitePlan | null>(null);
  const [brief, setBrief] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [assets, setAssets] = useState<Array<{ id: string; name: string; dataUrl: string; at: number }>>([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [starterOpen, setStarterOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [view, setView] = useState<"full" | "editor">("editor");
  const [live, setLive] = useState<{ url: string } | null>(null);
  const pendingGoLiveRef = useRef(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [fit, setFit] = useState(true);
  const [clipboard, setClipboard] = useState<{ type: SectionType; content: SectionContent[SectionType] } | null>(null);
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [cloudOn, setCloudOn] = useState(() => {
    try { return localStorage.getItem("bukkyai.cloudOn") === "1"; } catch { return false; }
  });
  const previewAreaRef = useRef<HTMLDivElement | null>(null);

  const designTimer = useRef<number | null>(null);

  const toggleCloud = (on: boolean) => {
    setCloudOn(on);
    try { localStorage.setItem("bukkyai.cloudOn", on ? "1" : "0"); } catch {}
  };

  // When arriving via /app?tier=pro|plus from the pricing page, open checkout
  // for that tier once signed in (the auth gate closes first).
  const pendingTier = useRef<"pro" | "plus" | null>(null);
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tier");
    if (t === "pro" || t === "plus") pendingTier.current = t;
  }, []);
  useEffect(() => {
    if (gateOpen) return;
    const t = pendingTier.current;
    if (!t) return;
    pendingTier.current = null;
    window.history.replaceState(null, "", window.location.pathname);
    buyPro(t);
    setPricingOpen(true);
  }, [gateOpen, authUid]);

  // Open a specific full template from ?template= (used by /made-with demos).
  const pendingTemplate = useRef<string | null>(null);
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const tmpl = qs.get("template");
    if (tmpl) pendingTemplate.current = tmpl;
    const ref = qs.get("ref");
    if (ref) {
      try {
        sessionStorage.setItem("bukkyai.ref", ref.slice(0, 64));
      } catch {}
    }
  }, []);
  useEffect(() => {
    if (gateOpen) return;
    const tmpl = pendingTemplate.current;
    if (!tmpl) return;
    pendingTemplate.current = null;
    window.history.replaceState(null, "", window.location.pathname);
    const map: Record<string, string> = {
      bakery: "tpl-bakery",
      saas: "tpl-saas",
      studio: "tpl-atelier",
      atelier: "tpl-atelier",
      wellness: "tpl-verdant",
      verdant: "tpl-verdant",
      hotel: "tpl-harbor",
      harbor: "tpl-harbor",
      restaurant: "tpl-metro",
      metro: "tpl-metro",
    };
    const id = map[tmpl] || tmpl;
    const tpl = fullTemplateById(id);
    if (!tpl) return;
    // Guard: don't silently clobber an existing open project.
    if (projectId || listProjects().length > 0) {
      if (!window.confirm(`Open the "${tpl.name}" template as a new project? Your current project stays saved.`)) return;
    }
    const { meta } = createProject(tpl.name);
    const doc = tpl.build();
    persistDoc(meta.id, doc);
    setProjects(listProjects());
    openProject(meta.id);
    pushMsg({ role: "assistant", text: `Loaded the ${tpl.name} template — every page written and designed. Make it yours.` });
  }, [gateOpen, authUid, projectId]);

  useEffect(() => {
    if (!authConfigured()) return;
    return onAuthChange((u) => {
      setAuthUid(u?.uid ?? null);
      setAuthEmail(u?.email ?? null);
      if (u) setGateOpen(false);
    });
  }, []);

  // Onboarding tour — shows up to 3 times for signed-in users only (guests get
  // the clean brief studio first), with a permanent "Don't show again" opt-out.
  const lastAuthForTour = useRef<string | null>(null);
  const tourGateShown = useRef(false);
  useEffect(() => {
    if (tourTurnedOff()) {
      lastAuthForTour.current = authUid;
      return;
    }
    if (!authUid) return;
    if (!tourCanShow()) return;
    if (!tourGateShown.current) {
      tourGateShown.current = true;
      lastAuthForTour.current = authUid;
      markTourShown();
      setTourOpen(true);
      return;
    }
    if (authUid !== lastAuthForTour.current) {
      lastAuthForTour.current = authUid;
      markTourShown();
      setTourOpen(true);
    }
  }, [authUid, gateOpen]);

  // "?" opens the keyboard shortcuts panel (when not typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) setShortcutsOpen(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Pull cloud projects into the local list when signed in + sync on
  useEffect(() => {
    if (!authUid || !cloudOn) return;
    let cancelled = false;
    void listCloudProjects(authUid, authEmail ?? undefined).then(({ projects: cloudList, invites: cloudInvites }) => {
      if (cancelled) return;
      setInvites(cloudInvites.map((i) => ({ id: i.id, name: i.name, role: i.role ?? "viewer" })));
      const local = listProjects();
      let changed = false;
      const next = [...local];
      for (const cp of cloudList) {
        if (!local.some((p) => p.id === cp.id)) {
          persistDoc(cp.id, cp.doc);
          next.unshift({ id: cp.id, name: cp.name, at: cp.at });
          changed = true;
        }
      }
      if (changed) {
        persistProjectsList(next);
        setProjects(listProjects());
      }
    });
    return () => { cancelled = true; };
  }, [authUid, cloudOn, authEmail]);

  // Debounced cloud save on doc changes
  useEffect(() => {
    if (!authUid || !cloudOn || !doc || !projectId) return;
    if (myRole.current === "viewer") return;
    const name = projects.find((p) => p.id === projectId)?.name ?? "Project";
    const t = window.setTimeout(() => {
      void saveProjectToCloud(authUid, projectId, name, doc, history).catch(() => {});
    }, 1500);
    return () => window.clearTimeout(t);
  }, [doc, projectId, authUid, cloudOn, projects, history]);

  // Realtime collaboration: apply remote changes pushed from other devices/tabs.
  const lastRemoteAt = useRef(0);
  const myRole = useRef<"owner" | "editor" | "viewer" | undefined>(undefined);
  useEffect(() => {
    if (!authUid || !cloudOn || !projectId) return;
    const unsub = subscribeCloudProject(authUid, projectId, (cp) => {
      if (!cp || !cp.doc) return;
      myRole.current = cp.role;
      if (cp.at <= lastRemoteAt.current) return;
      lastRemoteAt.current = cp.at;
      setDoc(cp.doc);
      setAssets(loadAssets(projectId));
      pushMsg({ role: "system", text: "A change from another device was applied." });
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUid, cloudOn, projectId]);

  // Live presence: heartbeat while a project is open, show who else is editing.
  useEffect(() => {
    if (!authUid || !cloudOn || !projectId) return;
    const name = (authEmail ?? "Someone").split("@")[0];
    const beat = () => void updatePresence(authUid, name, projectId);
    beat();
    const iv = window.setInterval(beat, 10000);
    const unsub = subscribePresence(projectId, authUid, setPresence);
    return () => {
      window.clearInterval(iv);
      unsub();
      void clearPresence(authUid);
      setPresence([]);
    };
  }, [authUid, cloudOn, projectId, authEmail]);

  // Load cloud history for the current project (for the History tab).
  useEffect(() => {
    if (!authUid || !cloudOn || !projectId) {
      setCloudHistory([]);
      return;
    }
    void loadCloudProject(authUid, projectId).then((cp) => {
      setCloudHistory(cp?.history ?? []);
    });
  }, [authUid, cloudOn, projectId, cursor]);

  const restoreCloudVersion = (cp: Checkpoint) => {
    if (!projectId) return;
    setDoc(cp.doc);
    setAssets(loadAssets(projectId));
    mutate(cp.doc, `Restored cloud version: ${cp.label}`, "manual");
    showToast("Restored cloud version");
  };

  const acceptInviteHandler = async (id: string) => {
    if (!authUid || !authEmail) return;
    const res = await acceptInvite(authUid, authEmail, id);
    if (res.ok) {
      setInvites((inv) => inv.filter((i) => i.id !== id));
      showToast("Invite accepted");
      const cloudList = await listCloudProjects(authUid, authEmail);
      const found = cloudList.projects.find((p) => p.id === id);
      if (found && !listProjects().some((p) => p.id === id)) {
        persistDoc(id, found.doc);
        const next = [{ id: found.id, name: found.name, at: found.at }, ...listProjects()];
        persistProjectsList(next);
        setProjects(listProjects());
      }
    } else {
      showToast(res.error ?? "Could not accept invite");
    }
  };

  const shareCurrentProject = async (email: string, role: "editor" | "viewer") => {
    if (!authUid || !projectId) return { ok: false, error: "Open a project first." };
    const res = await shareProject(authUid, projectId, email, role);
    if (res.ok && doc?.forms?.endpoint) {
      const proj = projects.find((p) => p.id === projectId);
      const inviteLink = `${window.location.origin}/app`;
      try {
        await fetch(doc.forms.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
          body: new URLSearchParams({
            _subject: `You've been invited to collaborate on "${proj?.name ?? "a bukkyai site"}"`,
            email,
            message: `You've been invited as a ${role}. Open ${inviteLink}, sign in with this email, and accept the invite to start editing.`,
          }).toString(),
        });
      } catch {}
    }
    return res;
  };

  useEffect(() => {
    if (projectId) persistChat(projectId, messages);
  }, [messages, projectId]);

  useEffect(() => {
    if (projectId) persistPlan(projectId, plan);
  }, [plan, projectId]);

  useEffect(() => {
    setProjects(listProjects());
    if (listProjects().length === 0) {
      const demo = demoProject();
      openProject(demo.meta.id);
    } else if (!projectId) {
      const first = listProjects()[0];
      openProject(first.id);
    }
  }, []);

  const pushMsg = (m: Omit<ChatMessage, "id">) =>
    setMessages((prev) => [...prev, { ...m, id: uid("msg") }]);

  const mutate = useCallback(
    (next: SiteBlueprint, label: string, source: Checkpoint["source"]) => {
      setHistory((prev) => {
        const clipped = prev.slice(0, cursor + 1);
        const chk = checkpoint(label, next, source);
        const hist = [...clipped, chk];
        setCursor(hist.length - 1);
        setDoc(next);
        if (projectId) {
          persistDoc(projectId, next);
          persistHistory(projectId, hist);
        }
        return hist;
      });
    },
    [cursor, projectId]
  );

  const openProject = (id: string) => {
    const { meta, doc: d, history: h } = loadProject(id);
    setProjectId(id);
    setDoc(d);
    setHistory(h);
    setCursor(h.length - 1);
    setPageIdx(0);
    setSelected(null);
    setPlan(loadPlan(id));
    setAssets(loadAssets(id));
    setBrief(d.meta.description || "");
    const saved = loadChat(id);
    setMessages(saved);
    if (saved.length === 0) {
      pushMsg({
        role: "system",
        text: `Project "${meta?.name ?? "Untitled"}" loaded. Everything is local — no credits, unlimited edits.`,
      });
    }
  };

  const newProject = () => {
    setStarterOpen(true);
  };

  const pickStarter = (starterId: string | null, name: string) => {
    setStarterOpen(false);
    if (starterId) {
      const starter = starterById(starterId);
      if (!starter) return;
      const { meta } = createProject(name);
      const doc = starter.build();
      persistDoc(meta.id, doc);
      setProjects(listProjects());
      openProject(meta.id);
      return;
    }
    const { meta } = createProject(name);
    setProjects(listProjects());
    openProject(meta.id);
  };

  const paymentLink = () => {
    const fromDoc = doc?.stripePaymentLink;
    if (fromDoc) return fromDoc;
    const fromEnv = import.meta.env.VITE_DEFAULT_PAYMENT_LINK as string | undefined;
    if (fromEnv) return fromEnv;
    return "";
  };

  const buyPro = (tier: "pro" | "plus" = "pro") => {
    void (async () => {
      if (!authEmail) {
        pushMsg({ role: "assistant", text: "Sign in first - paid access is tied to your account email, then you get a live checkout.", kind: "error" });
        setAuthOpen(true);
        return;
      }
      const res = await startProCheckout(authEmail, tier);
      if (res.error || !res.url) {
        const link = paymentLink();
        if (!link) {
          pushMsg({ role: "assistant", text: res.error ?? "Checkout isn't configured yet.", kind: "error" });
          return;
        }
        pushMsg({ role: "assistant", text: `Opening checkout in a new tab - access unlocks automatically after you pay. (${res.error ?? ""})` });
        window.open(link, "_blank", "noopener");
        return;
      }
      pushMsg({ role: "assistant", text: "Opening secure checkout - you'll return here and access unlocks automatically." });
      window.location.assign(res.url);
    })();
  };

  const publishAndShare = async () => {
    if (!doc) return;
    if (!authEmail) {
      pushMsg({ role: "assistant", text: "Sign in to publish — publishing is a paid Pro feature tied to your account email.", kind: "error" });
      setAuthOpen(true);
      return;
    }
    runBusy("Publishing your site…", async () => {
      const res = await publishSite(doc, authEmail, doc.meta.siteUrl);
      if (res.error) {
        pushMsg({ role: "assistant", text: `Publish failed: ${res.error}`, kind: "error" });
        showToast("Publish failed");
        if (res.error.toLowerCase().includes("pro required")) setPricingOpen(true);
      } else {
        const ok = await fetchEntitlement(authEmail);
        setProUnlocked(ok);
        setPro(ok);
        pushMsg({ role: "assistant", text: `Your site is live at ${res.url} — share it anywhere.` });
        showToast("Published!");
      }
    });
  };

  const publishLive = async (domain: string) => {
    if (!doc) return;
    const email = authEmail;
    if (!email) {
      setAuthOpen(true);
      return;
    }
    runBusy("Going live — publishing your site…", async () => {
      const res = await publishSite(doc, email, domain || undefined);
      if (res.error) {
        pushMsg({ role: "assistant", text: `Publish failed: ${res.error}`, kind: "error" });
        showToast("Publish failed");
        if (res.error.toLowerCase().includes("pro required")) {
          pendingGoLiveRef.current = true;
          setPricingOpen(true);
        }
        return;
      }
      const url = res.url ?? "";
      setLive({ url });
      showToast("Your website is live");
      pushMsg({ role: "assistant", text: `Your website is live at ${url} — share it anywhere.` });
    });
  };

  const goLive = (domain: string) => {
    if (!authEmail) {
      showToast("Sign in first — Go live is tied to your account");
      setAuthOpen(true);
      return;
    }
    if (proTier !== "pro" && proTier !== "plus") {
      pendingGoLiveRef.current = true;
      setPricingOpen(true);
      return;
    }
    void publishLive(domain);
  };

  // Refresh Pro entitlement when the signed-in email changes, and when a buyer
  // returns from checkout (?creem=success). The worker is the source of truth.
  useEffect(() => {
    if (!authEmail) return;
    void fetchEntitlementDetail(authEmail).then((d) => {
      setProUnlocked(d.active);
      setPro(d.active);
      setProTier(d.active ? (d.tier === "plus" ? "plus" : "pro") : undefined);
      if (d.active && new URLSearchParams(window.location.search).get("creem") === "success") {
        showToast("Pro unlocked — Publish & share is ready");
        try { window.history.replaceState(null, "", window.location.pathname); } catch {}
      }
      if (d.active && pendingGoLiveRef.current) {
        pendingGoLiveRef.current = false;
        setPricingOpen(false);
        void publishLive("");
      }
    });
  }, [authEmail]);

  const loadDemo = () => {
    const existing = listProjects().find((p) => p.name === "Northwind Coffee (demo)");
    if (existing) {
      openProject(existing.id);
    } else {
      const { meta } = demoProject();
      setProjects(listProjects());
      openProject(meta.id);
    }
  };

  const renameActiveProject = () => {
    if (!projectId) return;
    const cur = projects.find((p) => p.id === projectId)?.name ?? "";
    const name = (window.prompt("Project name", cur) ?? "").trim();
    if (!name || name === cur) return;
    renameProject(projectId, name);
    setProjects(listProjects());
    showToast("Project renamed");
  };

  const duplicateActiveProject = () => {
    if (!doc) return;
    const name = projects.find((p) => p.id === projectId)?.name ?? "Project";
    const copy = { ...doc, meta: { ...doc.meta, title: `${doc.meta.title} (copy)` } };
    const id = saveProjectAs(copy, `${name} (copy)`);
    setProjects(listProjects());
    openProject(id);
    showToast("Project duplicated");
  };

  const deleteActiveProject = () => {
    const id = projectId;
    if (!id) return;
    const name = projects.find((p) => p.id === id)?.name ?? "this project";
    const cloudNote = authUid && cloudOn ? " and from your cloud account" : "";
    if (!window.confirm(`Delete "${name}"? This removes it locally${cloudNote} — no undo.`)) return;
    deleteProject(id);
    if (authUid && cloudOn) void deleteCloudProject(authUid, id);
    const rest = listProjects();
    setProjects(rest);
    if (rest.length > 0) {
      openProject(rest[0].id);
    } else {
      setProjectId(null);
      setDoc(null);
      setHistory([]);
      setCursor(-1);
      setPageIdx(0);
      setSelected(null);
      setPlan(null);
      setAssets([]);
      setMessages([]);
      setBrief("");
    }
  };

  const runBusy = async (label: string, fn: () => Promise<void>) => {
    setBusy(true);
    setBusyLabel(label);
    setError(null);
    try {
      await fn();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      pushMsg({ role: "assistant", text: msg, kind: "error" });
    } finally {
      setBusy(false);
      setBusyLabel("");
    }
  };

  const startBuild = (text: string) => {
    if (!settings.apiKey?.trim()) {
      pushMsg({
        role: "assistant",
        text: "Add an API key first (Settings). Your key stays in your browser — it's never uploaded anywhere.",
        kind: "error",
      });
      showToast("Add an API key in Settings");
      setSettingsOpen(true);
      return;
    }
    setBrief(text);
    pushMsg({ role: "user", text });
    runBusy("Planning structure…", async () => {
      const res = await generatePlan(text, settings);
      if (res.error || !res.plan) {
        const err = res.error ?? "Planning failed.";
        pushMsg({ role: "assistant", text: err, kind: "error" });
        showToast(err);
        return;
      }
      setPlan(res.plan);
      const pages = res.plan.pages.map((p) => `${p.title} (${p.sections.length} sections)`).join(", ");
      pushMsg({
        role: "assistant",
        text: `Here's the plan for "${res.plan.meta.title}":\n\nPages: ${pages}\n\nTone: ${res.plan.tone}\n\nReview it on the Plan tab and hit "Approve & build" — or keep chatting to adjust it.`,
      });
      setTab("plan");
    });
  };

  const approvePlan = () => {
    if (!plan || !brief) return;
    runBusy("Building your site…", async () => {
      const res = await buildFromBrief(brief, settings, { onStatus: (label) => setBusyLabel(label) });
      if (res.error || !res.doc) {
        pushMsg({ role: "assistant", text: res.error ?? "Build failed.", kind: "error" });
        return;
      }
      mutate(res.doc, "Site built from brief", "content");
      setPageIdx(0);
      setLive(null);
      setView("full");
      setTab("chat");
      const pageCount = res.doc.pages.length;
      pushMsg({
        role: "assistant",
        text: `Your site is built — ${pageCount} page${pageCount > 1 ? "s" : ""} with a bespoke design system and full copy. It's already checkpointed, so jump back in History anytime.\n\nNow refine it: pick the Design tab to tweak colors, click any section in the preview (edit mode) to edit copy directly, or just tell me what to change.`,
      });
    });
  };

  const discardPlan = () => {
    setPlan(null);
    pushMsg({ role: "system", text: "Plan discarded. Describe a new one anytime." });
    setTab("chat");
  };

  const NEW_SITE_RE =
    /\b(new site|new website|new web site|from scratch|start fresh|start over|brand[ -]?new (site|website)|create a site|create a website|create site|build a site|build a website|build a new site|build a new website)\b/i;

  const chatSend = (text: string) => {
    const wantsNewSite = !doc || doc.pages.length === 0 || NEW_SITE_RE.test(text);
    if (wantsNewSite) {
      startBuild(text);
      return;
    }
    if (!settings.apiKey?.trim()) {
      pushMsg({
        role: "assistant",
        text: "Add an API key first (Settings) so the AI can edit your site.",
        kind: "error",
      });
      setSettingsOpen(true);
      return;
    }
    pushMsg({ role: "user", text });
    runBusy("Applying edit…", async () => {
      const res = await applyEdit(doc, text, settings, { onStatus: (label) => setBusyLabel(label) });
      if (res.error || !res.doc) {
        pushMsg({ role: "assistant", text: res.error ?? "Edit failed.", kind: "error" });
        return;
      }
      mutate(res.doc, res.summary ?? "AI edit", "edit");
      setSelected(null);
      pushMsg({ role: "assistant", text: res.summary ?? "Done." });
    });
  };

  const discussQuestion = (text: string) => {
    if (!doc) return;
    if (!settings.apiKey?.trim()) {
      setSettingsOpen(true);
      return;
    }
    pushMsg({ role: "user", text });
    const msgId = uid("msg");
    setMessages((prev) => [...prev, { id: msgId, role: "assistant", text: "" }]);
    runBusy("Thinking…", async () => {
      const res = await streamLLM(settings, DISCUSS_SYSTEM, discussUser(doc, text), (delta) => {
        setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, text: m.text + delta } : m)));
      });
      if (res.error) {
        setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, text: res.error ?? "No answer.", kind: "error" } : m)));
        return;
      }
    });
  };

  const askImagePrompt = (hint: string): string => {
    const v = (window.prompt("Describe the image (leave blank for auto)", hint) ?? "").trim();
    return v || hint;
  };

  const doGenerateImage = async (prompt: string): Promise<string | null> => {
    if (!settings.apiKey?.trim()) {
      pushMsg({ role: "assistant", text: "Add a Gemini API key in Settings to generate images.", kind: "error" });
      showToast("Add a Gemini API key in Settings");
      setSettingsOpen(true);
      return null;
    }
    if (!canGenerateImages(settings)) {
      pushMsg({
        role: "assistant",
        text: "Image generation uses the Gemini API — switch the AI provider to Google Gemini in Settings.",
        kind: "error",
      });
      showToast("Switch AI provider to Google Gemini");
      setSettingsOpen(true);
      return null;
    }
    setImgBusy(true);
    const res = await generateSiteImage(settings, prompt);
    setImgBusy(false);
    if (!res.dataUrl) {
      const err = res.error ?? "Image generation failed.";
      pushMsg({ role: "assistant", text: err, kind: "error" });
      showToast(err);
      return null;
    }
    if (projectId) {
      addAssetDataUrl(projectId, `AI · ${prompt.slice(0, 26)}`, res.dataUrl);
      setAssets(loadAssets(projectId));
    }
    showToast("Image generated");
    return res.dataUrl;
  };

  const generateSectionImage = async (fieldPath: string): Promise<string | null> => {
    const sec = selected ? doc?.pages[selected.p]?.sections[selected.s] : null;
    const label = sec ? (SECTION_LABEL[sec.type] ?? sec.type) : "section";
    const prompt = askImagePrompt(`A high-quality photo for the ${label} ${fieldPath.split(".").slice(-1)[0]} field of "${doc?.meta.title}"`);
    return doGenerateImage(prompt);
  };

  const generateMediaImage = async (): Promise<void> => {
    const prompt = askImagePrompt(`A high-quality hero photo for "${doc?.meta.title}"`);
    const url = await doGenerateImage(prompt);
    if (url) showToast("Image added to your library");
  };

  const generateMediaImageForPost = async (): Promise<string | null> => {
    const prompt = askImagePrompt(`A high-quality blog cover photo for "${doc?.meta.title}"`);
    return doGenerateImage(prompt);
  };

  const updateDoc = (next: SiteBlueprint) => {
    mutate(next, "Site update", "manual");
  };

  const translateAllFor = async (lang: string): Promise<{ ok: boolean; error?: string }> => {
    if (!doc || !settings.apiKey?.trim()) {
      pushMsg({ role: "assistant", text: "Add an API key first (Settings) to translate the site.", kind: "error" });
      setSettingsOpen(true);
      return { ok: false, error: "No API key" };
    }
    let ok = false;
    await runBusy(`Translating to ${lang}…`, async () => {
      const res = await translateSite(doc, lang, settings, { onStatus: (l) => setBusyLabel(l) });
      if (res.error || !res.translations) {
        pushMsg({ role: "assistant", text: res.error ?? "Translation failed.", kind: "error" });
        return;
      }
      const current = { ...doc };
      const langs = current.languages ?? { default: current.meta.lang ?? "en", supported: [], translations: {} };
      const supported = langs.supported.includes(lang) ? langs.supported : [...langs.supported, lang];
      const translations = { ...(langs.translations ?? {}), [lang]: res.translations };
      mutate({ ...current, languages: { default: langs.default, supported, translations } }, `Translated site to ${lang}`, "edit");
      pushMsg({ role: "assistant", text: `Translated ${Object.keys(res.translations).length} strings to ${lang}. Check the preview.` });
      ok = true;
    });
    return { ok, error: undefined };
  };

  const snapshot = () => {
    if (!doc) return;
    const label = window.prompt("Checkpoint name (optional)", "Manual snapshot");
    mutate(JSON.parse(JSON.stringify(doc)) as SiteBlueprint, label || "Manual snapshot", "manual");
    showToast("Checkpoint saved");
  };

  const restore = (i: number) => {
    if (i < 0 || i >= history.length) return;
    setCursor(i);
    const d = history[i].doc;
    setDoc(d);
    setAssets(loadAssets(projectId ?? ""));
    if (projectId) persistDoc(projectId, d);
    pushMsg({ role: "system", text: `Time-traveled back to: ${history[i].label}` });
  };

  const changeDesign = (design: DesignSystem) => {
    if (!doc) return;
    const next = { ...doc, design };
    setDoc(next);
    if (projectId) persistDoc(projectId, next);
    if (designTimer.current) window.clearTimeout(designTimer.current);
    designTimer.current = window.setTimeout(() => mutate(next, "Design tweak", "manual"), 900);
  };

  const harmonizeDesign = () => {
    if (!doc) return;
    const res = harmonize(doc.design);
    changeDesign(res.design);
    showToast(`Harmony ${res.before.total} → ${res.after.total}: ${res.changes[0] ?? "no changes needed"}`);
  };

  const generateOgImage = () => {
    if (!doc) return;
    runBusy("Rendering share image.", async () => {
      const url = await renderOgImage(doc);
      if (!url) return;
      const next = { ...doc, meta: { ...doc.meta, ogImage: url } };
      mutate(next, "Generated OG share image", "design");
      showToast("Share image generated");
    });
  };

  const fillAlts = () => {
    if (!doc) return;
    const { doc: next, count } = fillAltText(doc);
    if (count === 0) {
      showToast("All images already have alt text");
      return;
    }
    mutate(next, `Filled ${count} image alt text`, "edit");
    showToast(`Filled ${count} alt text`);
  };

  const generatePosts = () => {
    if (!doc) return;
    if (!settings.apiKey?.trim()) {
      pushMsg({ role: "assistant", text: "Add an API key first (Settings) so the AI can write posts.", kind: "error" });
      setSettingsOpen(true);
      return;
    }
    runBusy("Writing three blog posts…", async () => {
      const res = await generateBlogPosts(doc, settings, { onStatus: (label) => setBusyLabel(label) });
      if (res.error || res.posts.length === 0) {
        pushMsg({ role: "assistant", text: res.error ?? "Post generation failed.", kind: "error" });
        return;
      }
      const existing = doc.posts ?? [];
      mutate({ ...doc, posts: [...res.posts, ...existing] }, "AI wrote 3 blog posts", "content");
      pushMsg({ role: "assistant", text: `Wrote ${res.posts.length} posts: ${res.posts.map((p) => `"${p.title}"`).join(", ")}. Edit them in the Posts tab.` });
      showToast("3 posts written");
    });
  };


  const applyPreset = (name: string) => {
    const preset = DESIGN_PRESETS.find((p) => p.name === name);
    if (!preset) return;
    const system = JSON.parse(JSON.stringify(preset.system)) as DesignSystem;
    changeDesign(system);
    showToast(`Applied ${preset.name} design`);
  };

  const applyGeneratedTheme = (theme: GeneratedTheme) => {
    if (proTier !== "plus") {
      setPricingOpen(true);
      return;
    }
    changeDesign(JSON.parse(JSON.stringify(theme.system)) as DesignSystem);
    setThemesOpen(false);
    showToast(`Applied theme: ${theme.name}`);
  };

  const applyVariantDesign = (design: DesignSystem) => {
    changeDesign(JSON.parse(JSON.stringify(design)) as DesignSystem);
    setVariantsOpen(false);
    showToast("Applied design variant");
  };

  const regenerateDesign = () => {
    if (!doc) return;
    if (!settings.apiKey?.trim()) {
      pushMsg({ role: "assistant", text: "Add an API key first (Settings).", kind: "error" });
      setSettingsOpen(true);
      return;
    }
    runBusy("Reinventing the design…", async () => {
      const sourceBrief = brief || doc.meta.description || "A polished, distinctive website";
      const res = await generateDesign(sourceBrief, plan, settings, doc.design);
      if (res.error || !res.design) {
        pushMsg({ role: "assistant", text: res.error ?? "Design regeneration failed.", kind: "error" });
        return;
      }
      const next = { ...doc, design: res.design };
      mutate(next, "AI regenerated the design system", "design");
      pushMsg({ role: "assistant", text: `New design system: "${res.design.name}". Fresh colors, fonts, and spacing applied everywhere.` });
      setTab("design");
    });
  };

  const setVoice = (v: string) => {
    if (!doc) return;
    const next = { ...doc, voice: v };
    mutate(next, "Updated voice", "manual");
  };

  const setTone = (t: string) => {
    if (!doc || !settings.apiKey?.trim()) {
      pushMsg({ role: "assistant", text: "Add an API key first (Settings).", kind: "error" });
      setSettingsOpen(true);
      return;
    }
    runBusy("Rewriting the voice…", async () => {
      const res = await toneRewrite(doc, t === "bold" ? "confident and punchy" : t === "minimal" ? "clean and spare" : "your brand's natural voice", t === "minimal" ? "short" : "natural", settings, { onStatus: (label) => setBusyLabel(label) });
      if (res.error || !res.doc) {
        pushMsg({ role: "assistant", text: res.error ?? "Tone rewrite failed.", kind: "error" });
        return;
      }
      mutate(res.doc, `Tone: ${t}`, "edit");
      pushMsg({ role: "assistant", text: res.summary ?? "Voice updated." });
    });
  };

  const uploadBrand = async (f: File) => {
    const { paletteFromImage } = await import("./lib/brand");
    const pal = await paletteFromImage(f);
    if (!pal) {
      showToast("Could not read colors from that image");
      return;
    }
    if (!doc) return;
    const next = { ...doc, design: { ...doc.design, name: `${doc.design.name} + brand`, tokens: { ...doc.design.tokens, colors: { ...doc.design.tokens.colors, ...pal.colors } } } };
    mutate(next, "Brand colors applied", "design");
    showToast("Brand palette applied");
  };

  const selectSection = (p: number, s: number) => {
    setSelected({ p, s });
    setTab("inspect");
  };

  const changeSectionContent = (p: number, s: number, content: SectionContent[SectionType]) => {
    if (!doc) return;
    const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
    next.pages[p].sections[s].content = content;
    mutate(next, `Edited ${SECTION_LABEL[next.pages[p].sections[s].type]} section`, "manual");
  };

  const setSectionMotion = (motion: SectionMotion) => {
    if (!doc || !selected) return;
    const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
    next.pages[selected.p].sections[selected.s].motion = motion;
    mutate(next, "Changed section motion", "manual");
  };

  const handleFieldEdit = (path: string, value: string) => {
    if (!doc) return;
    const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
    setField(next as unknown as Record<string, unknown>, path, value);
    mutate(next, "Edited text in canvas", "manual");
  };

  const handleImageField = async (path: string) => {
    if (!doc) return;
    const hint = `Image for ${path.split(".").slice(-1)[0]}`;
    const prompt = (window.prompt("Paste an image URL, or describe an image to generate (blank = cancel)", `Generate: a photo for ${hint}`) ?? "").trim();
    if (!prompt) return;
    let url: string | null = null;
    if (/^(https?:|data:)/i.test(prompt)) {
      url = prompt;
    } else {
      url = await doGenerateImage(prompt);
    }
    if (!url) return;
    const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
    setField(next as unknown as Record<string, unknown>, path, url);
    mutate(next, "Replaced image", "manual");
  };

  const [insertAt, setInsertAt] = useState<{ p: number; s: number } | null>(null);

  const handleInsertAt = (p: number, s: number) => {
    setInsertAt({ p, s });
  };

  const insertSection = (type: string) => {
    if (!doc || !insertAt) return;
    const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
    const tpl = SECTION_TEMPLATES.find((t) => t.id === type);
    const sec = tpl ? tpl.build() : { id: uid(), type: type as SectionType, content: emptyContent(type as SectionType) };
    next.pages[insertAt.p].sections.splice(insertAt.s, 0, sec);
    mutate(next, `Inserted ${tpl?.name ?? SECTION_LABEL[type as SectionType] ?? type} section`, "manual");
    setInsertAt(null);
  };

  const removeSection = (p: number, s: number) => {
    if (!doc) return;
    const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
    const [sec] = next.pages[p].sections.splice(s, 1);
    mutate(next, `Removed ${sec ? SECTION_LABEL[sec.type] : "section"}`, "manual");
    setSelected(null);
  };

  const addSection = (p: number, type: string) => {
    if (!doc) return;
    const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
    next.pages[p].sections.push({
      id: uid(),
      type: type as SectionType,
      content: emptyContent(type as SectionType),
    });
    mutate(next, `Added ${SECTION_LABEL[type as SectionType] ?? type} section`, "manual");
  };

  const addSectionTemplate = (p: number, templateId: string) => {
    if (!doc) return;
    const tpl = SECTION_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
    next.pages[p].sections.push(tpl.build());
    mutate(next, `Added ${tpl.name} section from template`, "manual");
  };

  const addPage = () => {
    if (!doc) return;
    const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
    next.pages.push({
      id: uid("pg"),
      slug: "",
      title: `Page ${next.pages.length + 1}`,
      description: "",
      sections: [],
    });
    mutate(next, `Added page ${next.pages.length}`, "manual");
    setPageIdx(next.pages.length - 1);
    setSelected(null);
  };

  const renamePage = (idx: number, patch: Partial<Pick<Page, "slug" | "title" | "description" | "password">>) => {
    if (!doc) return;
    const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
    const cur = next.pages[idx];
    if (!cur) return;
    if (patch.slug !== undefined) {
      const slug = (patch.slug || "")
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      next.pages[idx] = { ...cur, slug };
    } else {
      next.pages[idx] = { ...cur, ...patch };
    }
    mutate(next, `Edited page "${next.pages[idx].title || next.pages[idx].slug || "Untitled"}"`, "manual");
  };

  const deletePage = (idx: number) => {
    if (!doc) return;
    if (doc.pages.length <= 1) {
      showToast("Keep at least one page");
      return;
    }
    if (!window.confirm(`Delete page "${doc.pages[idx]?.title || "Untitled"}"?`)) return;
    const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
    next.pages.splice(idx, 1);
    mutate(next, `Deleted page ${idx + 1}`, "manual");
    if (pageIdx >= next.pages.length) setPageIdx(next.pages.length - 1);
    setSelected(null);
  };

  const moveSection = (fromP: number, fromS: number, toP: number, toS: number) => {
    if (!doc) return;
    const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
    const [sec] = next.pages[fromP].sections.splice(fromS, 1);
    next.pages[toP].sections.splice(toS, 0, sec);
    mutate(next, "Reordered section", "manual");
    setSelected(null);
  };

  const duplicateSection = () => {
    if (!doc || !selected) return;
    const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
    const src = next.pages[selected.p].sections[selected.s];
    if (!src) return;
    const copy = { id: uid(), type: src.type, content: JSON.parse(JSON.stringify(src.content)) as SectionContent[SectionType] };
    next.pages[selected.p].sections.splice(selected.s + 1, 0, copy);
    mutate(next, `Duplicated ${SECTION_LABEL[src.type] ?? src.type} section`, "manual");
    setSelected({ p: selected.p, s: selected.s + 1 });
  };

  const copySection = () => {
    if (!doc || !selected) return;
    const sec = doc.pages[selected.p].sections[selected.s];
    if (!sec) return;
    setClipboard({ type: sec.type, content: JSON.parse(JSON.stringify(sec.content)) as SectionContent[SectionType] });
    showToast("Section copied — Paste inserts after the selected section");
  };

  const pasteSection = () => {
    if (!doc || !clipboard) {
      showToast("Copy a section first");
      return;
    }
    const targetP = selected?.p ?? pageIdx;
    const targetPage = doc.pages[targetP];
    if (!targetPage) return;
    const at = selected ? selected.s + 1 : targetPage.sections.length;
    const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
    next.pages[targetP].sections.splice(at, 0, {
      id: uid(),
      type: clipboard.type,
      content: JSON.parse(JSON.stringify(clipboard.content)) as SectionContent[SectionType],
    });
    mutate(next, `Pasted ${SECTION_LABEL[clipboard.type] ?? clipboard.type} section`, "manual");
    setSelected({ p: targetP, s: at });
  };

  const rewriteSection = () => {
    if (!doc || !selected) return;
    if (!plan) {
      pushMsg({ role: "assistant", text: "No plan available to rewrite from. Ask me to rewrite it in chat instead.", kind: "error" });
      return;
    }
    runBusy("Rewriting section…", async () => {
      const sourceBrief = brief || doc.meta.description;
      const res = await regenerateSection(doc, sourceBrief, plan, selected.p, selected.s, settings, { onStatus: (label) => setBusyLabel(label) });
      if (res.error || !res.doc) {
        pushMsg({ role: "assistant", text: res.error ?? "Rewrite failed.", kind: "error" });
        return;
      }
      mutate(res.doc, "Rewrote section with AI", "edit");
      pushMsg({ role: "assistant", text: "Section rewritten. Check the preview." });
    });
  };

  const rewriteField = async (fieldPath: string, currentValue: string, context: string) => {
    if (!doc || !selected || !settings.apiKey?.trim()) {
      pushMsg({ role: "assistant", text: "Add an API key first (Settings).", kind: "error" });
      setSettingsOpen(true);
      return;
    }
    runBusy("Rewriting field…", async () => {
      const res = await fieldRewrite(doc, doc.pages[selected.p].sections[selected.s].type, fieldPath, currentValue, context, settings);
      if (res.error || res.value === null) {
        pushMsg({ role: "assistant", text: res.error ?? "Rewrite failed.", kind: "error" });
        return;
      }
      changeSectionContent(selected.p, selected.s, setContentByPath(doc, selected.p, selected.s, fieldPath, res.value));
      pushMsg({ role: "assistant", text: `Rewrote "${fieldPath}".` });
    });
  };

  const uploadMedia = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const f = input.files?.[0];
      if (f && projectId) {
        addAsset(projectId, f).then((asset) => {
          if (asset) setAssets((a) => [asset, ...a]);
        });
      }
    };
    input.click();
  };

  const deleteMedia = (id: string) => {
    if (projectId) {
      removeAsset(projectId, id);
      setAssets((a) => a.filter((x) => x.id !== id));
    }
  };

  const insertMedia = (dataUrl: string, fieldPath: string) => {
    if (!doc || !selected) return;
    changeSectionContent(selected.p, selected.s, setContentByPath(doc, selected.p, selected.s, fieldPath, dataUrl));
    showToast(`Inserted media`);
  };

  const saveSettingsCb = (s: LLMSettings & { githubToken?: string }) => {
    setSettings(s);
    saveSettings(s);
    pushMsg({ role: "system", text: `AI provider set to ${s.provider}. Everything still runs locally — no credits, no limits.` });
  };

  const saveSiteMeta = (m: { password?: string; stripePaymentLink?: string; embedHead?: string; embedBody?: string; formEndpoint?: string; analyticsDomain?: string; cookieEnabled?: boolean; cookieText?: string; cookiePolicyUrl?: string; redirects?: string; themeToggle?: boolean; themeDefaultMode?: "auto" | "light" | "dark"; siteUrl?: string; stickyNav?: boolean; announcementText?: string; announcementHref?: string; popupEnabled?: boolean; popupTitle?: string; popupText?: string; popupButtonLabel?: string; popupCtaUrl?: string; popupDelaySec?: number; popupTrigger?: "time" | "exit" | "scroll"; popupScrollPct?: number; customFonts?: string; emailServiceProvider?: string; emailServiceEndpoint?: string; emailServiceApiKey?: string; emailServiceListId?: string; coupons?: string; orderNotify?: string; maintenanceEnabled?: boolean; maintenanceTitle?: string; maintenanceText?: string; maintenanceEmail?: string }) => {
    if (!doc) return;
    const next = { ...doc };
    if (m.password !== undefined) next.password = m.password;
    if (m.stripePaymentLink !== undefined) next.stripePaymentLink = m.stripePaymentLink;
    if (m.coupons !== undefined) {
      next.coupons = (m.coupons ?? "")
        .split(/\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const parts = line.split(/\s+/);
          const code = (parts[0] ?? "").toUpperCase();
          const percentOff = Number(parts[1]);
          return code && !Number.isNaN(percentOff) ? { code, percentOff } : null;
        })
        .filter((c): c is { code: string; percentOff: number } => c !== null);
      if (!next.coupons.length) next.coupons = undefined;
    }
    if (m.orderNotify !== undefined) next.orderNotify = m.orderNotify.trim() || undefined;
    if (m.maintenanceEnabled !== undefined) {
      next.maintenance = m.maintenanceEnabled
        ? { enabled: true, title: m.maintenanceTitle?.trim() || undefined, text: m.maintenanceText?.trim() || undefined, email: m.maintenanceEmail?.trim() || undefined }
        : undefined;
    }
    if (m.emailServiceProvider !== undefined) {
      if (!m.emailServiceProvider || !m.emailServiceEndpoint?.trim()) {
        next.forms = { ...(next.forms ?? {}), emailService: undefined };
      } else {
        next.forms = {
          ...(next.forms ?? {}),
          emailService: {
            provider: m.emailServiceProvider,
            endpoint: m.emailServiceEndpoint.trim(),
            apiKey: m.emailServiceApiKey?.trim() || undefined,
            listId: m.emailServiceListId?.trim() || undefined,
          },
        };
      }
    }
    if (m.siteUrl !== undefined) {
      next.meta = { ...next.meta, siteUrl: m.siteUrl.trim() || undefined };
    }
    if (m.stickyNav !== undefined) {
      next.nav = { ...next.nav, sticky: m.stickyNav };
    }
    if (m.announcementText !== undefined) {
      const text = m.announcementText.trim();
      next.announcement = text ? { text, href: m.announcementHref?.trim() || undefined } : undefined;
    }
    if (m.popupEnabled !== undefined) {
      next.popup = m.popupEnabled
        ? {
            enabled: true,
            title: m.popupTitle?.trim() || undefined,
            text: m.popupText?.trim() || undefined,
            buttonLabel: m.popupButtonLabel?.trim() || undefined,
            ctaUrl: m.popupCtaUrl?.trim() || undefined,
            delaySec: m.popupDelaySec ?? 6,
            trigger: m.popupTrigger ?? "time",
            scrollPct: m.popupScrollPct ?? 60,
          }
        : undefined;
    }
    if (m.customFonts !== undefined) {
      const parsed: { name: string; url: string; weight?: string }[] = (m.customFonts ?? "")
        .split(/\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const parts = line.split(/\s+/);
          const name = parts[0] ?? "";
          const url = parts[1] ?? "";
          return name && url ? { name, url, weight: parts[2] } : null;
        })
        .filter((f): f is { name: string; url: string; weight: string } => f !== null);
      next.customFonts = parsed.length ? parsed : undefined;
    }
    if (m.formEndpoint !== undefined) {
      const ep = (m.formEndpoint ?? "").trim();
      next.forms = { ...(next.forms ?? {}), endpoint: ep || undefined };
    }
    if (m.analyticsDomain !== undefined) {
      const d = (m.analyticsDomain ?? "").trim().toLowerCase();
      if (!d) next.analytics = undefined;
      else if (d.includes(".")) next.analytics = { plausible: d };
      else next.analytics = { goatcounter: d };
    }
    if (m.cookieEnabled !== undefined) {
      next.cookieConsent = m.cookieEnabled
        ? { enabled: true, text: m.cookieText?.trim() || undefined, policyUrl: m.cookiePolicyUrl?.trim() || undefined }
        : undefined;
    }
    if (m.themeToggle !== undefined) {
      next.theme = m.themeToggle
        ? { toggle: true, defaultMode: m.themeDefaultMode ?? "auto" }
        : undefined;
    }
    if (m.redirects !== undefined) {
      const rules = (m.redirects ?? "")
        .split(/\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const m2 = line.split(/\s*(?:→|->|=>|\s)\s*/, 2);
          const from = (m2[0] ?? "").trim();
          const to = (m2[1] ?? "").trim();
          return from && to ? { from, to } : null;
        })
        .filter((r): r is { from: string; to: string } => r !== null);
      next.redirects = rules.length ? rules : undefined;
    }
    const head = m.embedHead ?? "";
    const body = m.embedBody ?? "";
    next.embeds = {
      head: head.trim() ? [head.trim()] : [],
      body: body.trim() ? [body.trim()] : [],
    };
    mutate(next, "Updated site settings", "manual");
    showToast("Site settings saved");
  };

  const importFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = importProjectFromJson(String(reader.result ?? ""));
      if ("error" in res) {
        showToast(res.error);
        return;
      }
      setProjects(listProjects());
      openProject(res.meta.id);
    };
    reader.readAsText(f);
  };

  const githubBackup = async () => {
    if (!doc || !settings.githubToken) {
      setSettingsOpen(true);
      return;
    }
    runBusy("Backing up to GitHub…", async () => {
      const title = doc.meta.title || "bukkyai site";
      const res = await backupToGithub(settings.githubToken!, doc, title);
      if (res.error) pushMsg({ role: "assistant", text: res.error, kind: "error" });
      else {
        pushMsg({ role: "assistant", text: `Backed up to GitHub: ${res.url}` });
        showToast("Backed up to GitHub");
      }
    });
  };

  const deploySite = async () => {
    if (!doc || !settings.githubToken) {
      pushMsg({ role: "assistant", text: "Add a GitHub token in Settings to deploy (needs repo + pages scopes).", kind: "error" });
      setSettingsOpen(true);
      return;
    }
    runBusy("Deploying to GitHub Pages…", async () => {
      const res = await deployToGithubPages(settings.githubToken!, doc, doc.meta.title || "site");
      if (res.error) {
        pushMsg({ role: "assistant", text: `Deploy failed: ${res.error}`, kind: "error" });
        showToast("Deploy failed");
      } else {
        pushMsg({ role: "assistant", text: `Your site is live at ${res.url} (may take a minute to publish).` });
        showToast("Deployed to GitHub Pages");
      }
    });
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const cmdActions = [
    { category: "Project", label: "New project", onRun: newProject },
    { category: "Project", label: "Import JSON", onRun: () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json,application/json";
      input.onchange = () => {
        const f = input.files?.[0];
        if (f) importFile(f);
      };
      input.click();
    } },
    { category: "Project", label: "Snapshot now", onRun: snapshot },
    { category: "AI", label: "Rewrite this section", onRun: rewriteSection },
    { category: "AI", label: "Regenerate design", onRun: regenerateDesign },
    { category: "View", label: "Toggle edit mode", onRun: () => setEditMode((v) => !v) },
    { category: "Export", label: "Export site (.zip)", onRun: () => { if (doc) { void downloadStaticZip(doc); showToast("Site exported as zip"); } } },
    { category: "Export", label: "Blueprint JSON", onRun: () => { if (doc) { downloadBlueprintJson(doc); showToast("Blueprint JSON exported"); } } },
  ];

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        if (cursor > 0) restore(cursor - 1);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const toggleFullscreen = () => {
    const el = previewAreaRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen().catch(() => {});
    }
  };

  const page = doc?.pages[pageIdx];
  const hasPages = Boolean(doc && doc.pages.length > 0);

  const tourSteps: TourStep[] = [
    {
      target: ".brief-studio",
      title: "Welcome to bukkyai",
      body: "Describe your business in a sentence — bukkyai plans your site, designs a design system, and writes every page. This tour walks you through every feature.",
      prepare: () => { if (!projectId) setTab("chat"); },
    },
    {
      target: ".brief-input-lg",
      title: "1. Write your brief",
      body: "Type what your site is about here — e.g. \"a bakery in Austin called June & Oak, warm and artisanal\". Add features, a theme direction and more below, then hit Design my website.",
      align: "below",
    },
    {
      target: ".project-picker",
      title: "2. Start from a template",
      body: "Prefer a head start? Click \"New\" and open Full templates — six ready-made multi-page sites (bakery, SaaS, studio, wellness, hotel, restaurant) with full copy and design, ready to edit.",
      align: "below",
    },
    {
      target: ".left-rail",
      title: "3. Pages & sections",
      body: "Your pages and sections live here. Add new sections from templates, reorder them, or delete ones you don't need.",
      align: "right",
    },
    {
      target: ".preview-area",
      title: "4. The live preview",
      body: "Your site renders here in real time. This is exactly what visitors will see — every edit applies instantly.",
      align: "above",
    },
    {
      target: ".preview-toolbar",
      title: "5. Edit mode & devices",
      body: "Flip on Edit mode to click any text and edit it directly in the preview. Switch between desktop, tablet and mobile, or zoom with Fit / 100%.",
      align: "below",
    },
    {
      target: ".right-panel .tabs",
      title: "6. The tabs",
      body: "The next several steps cover every tab in this panel: Chat, Design, Media, Code, Inspect, Plan, History, Posts, Pages, Lang, SEO and Analytics.",
      align: "above",
    },
    {
      target: ".right-panel .tabs button:nth-child(1)",
      title: "7. Chat",
      body: "Ask anything about your site or type an instruction — \"make the hero CTA red\" — and bukkyai edits the blueprint for you.",
      align: "below",
      prepare: () => setTab("chat"),
    },
    {
      target: ".right-panel .tabs button:nth-child(2)",
      title: "8. Design",
      body: "Voice & tone, one-click design presets, the design-harmony score with a Harmonize button, and uploading a brand kit (logo + colors).",
      align: "below",
      prepare: () => setTab("design"),
    },
    {
      target: ".right-panel .tabs button:nth-child(3)",
      title: "9. Media",
      body: "Your image library. Upload images (auto-compressed), or generate new ones with AI from a prompt.",
      align: "below",
      prepare: () => setTab("media"),
    },
    {
      target: ".right-panel .tabs button:nth-child(4)",
      title: "10. Code",
      body: "The blueprint's code view — inspect the generated CSS and structure, or copy it for your own use.",
      align: "below",
      prepare: () => setTab("code"),
    },
    {
      target: ".right-panel .tabs button:nth-child(5)",
      title: "11. Inspect",
      body: "Select any section in the preview, then edit every field here: images, text, layout, animations and even rewrite with AI.",
      align: "below",
      prepare: () => setTab("inspect"),
    },
    {
      target: ".right-panel .tabs button:nth-child(6)",
      title: "12. Plan",
      body: "See the site structure bukkyai planned — pages and their sections — before or after building.",
      align: "below",
      prepare: () => setTab("plan"),
    },
    {
      target: ".right-panel .tabs button:nth-child(7)",
      title: "13. History",
      body: "Every change is checkpointed. Travel back in time to any earlier version of your site and restore it.",
      align: "below",
      prepare: () => setTab("history"),
    },
    {
      target: ".right-panel .tabs button:nth-child(8)",
      title: "14. Posts",
      body: "Your blog. Write posts, import Markdown files, and set cover images, categories and authors.",
      align: "below",
      prepare: () => setTab("posts"),
    },
    {
      target: ".right-panel .tabs button:nth-child(9)",
      title: "15. Pages",
      body: "Manage the site's pages — add, rename, and delete them. The site can be as many pages as you want.",
      align: "below",
      prepare: () => setTab("pages"),
    },
    {
      target: ".right-panel .tabs button:nth-child(10)",
      title: "16. Languages",
      body: "Add languages to make your site multi-lingual. Visitors get a language switcher in the nav.",
      align: "below",
      prepare: () => setTab("langs"),
    },
    {
      target: ".right-panel .tabs button:nth-child(11)",
      title: "17. SEO",
      body: "A live quality score, WCAG contrast checks, AI auto-fix, and a share-image generator for your pages.",
      align: "below",
      prepare: () => setTab("seo"),
    },
    {
      target: ".right-panel .tabs button:nth-child(12)",
      title: "18. Analytics",
      body: "Connect Plausible or GoatCounter in Settings, then view or embed your traffic dashboard here.",
      align: "below",
      prepare: () => setTab("analytics"),
    },
    {
      target: ".project-picker",
      title: "19. Projects",
      body: "Switch projects, create new ones, rename, duplicate, or delete — all from this picker.",
      align: "below",
    },
    {
      target: ".header .auth-chip",
      title: "20. Sign in & cloud sync",
      body: "Sign in with Google or email to sync projects to the cloud, invite collaborators, and keep working from any device.",
      align: "below",
    },
    {
      target: ".header .btn",
      title: "21. Settings",
      body: "Configure your AI provider (your key stays local), form endpoints, analytics, cookie consent, redirects, custom fonts, commerce coupons and more.",
      align: "below",
    },
    {
      target: ".header .btn",
      title: "22. Publish & share",
      body: "Open the export menu: publish a live link (Pro), deploy to GitHub Pages, or download a zip / React project / CMS export. You're all set!",
      align: "above",
    },
  ];

  return (
    <div className="app">
      <Header
        projects={projects}
        activeId={projectId}
        busy={busy}
        busyLabel={busyLabel}
        onSelectProject={(id) => openProject(id)}
        onDeleteProject={deleteActiveProject}
        onRenameProject={renameActiveProject}
        onDuplicateProject={duplicateActiveProject}
        onNewProject={newProject}
        onDemo={loadDemo}
        onImport={importFile}
        onSnapshot={snapshot}
        onExportZip={() => {
          if (doc) {
            void downloadStaticZip(doc);
            showToast("Site exported as zip");
          }
        }}
        onExportSingle={() => {
          if (doc) {
            downloadSingleFile(doc);
            showToast("Single-file HTML exported");
          }
        }}
        onExportReact={() => {
          if (doc) {
            void downloadReactProject(doc);
            showToast("React project exported");
          }
        }}
        onExportCms={() => {
          if (doc) {
            void downloadCmsExport(doc);
            showToast("CMS export ready");
          }
        }}
        onBlueprintJson={() => {
          if (doc) {
            downloadBlueprintJson(doc);
            showToast("Blueprint JSON exported");
          }
        }}
        onPrintPlan={() => {
          if (doc) printBlueprint(doc);
        }}
        onPublishPreview={() => {
          if (doc) {
            void publishPreview(doc);
            showToast("Preview opened");
          }
        }}
        onGithubBackup={githubBackup}
        onDeploy={deploySite}
        onPublish={() => void publishAndShare()}
        onOpenSettings={() => setSettingsOpen(true)}
        onAuth={() => setAuthOpen(true)}
        onPricing={() => setPricingOpen(true)}
        onShare={authUid && cloudOn ? () => setShareOpen(true) : undefined}
        onReferral={authUid && authEmail ? () => setReferralOpen(true) : undefined}
        invites={invites.length}
        onAcceptInvites={invites.length ? async () => { for (const i of invites) await acceptInviteHandler(i.id); } : undefined}
        onHelp={() => setTourOpen(true)}
        presence={presence.map((p) => ({ name: p.name }))}
      />
      {shareOpen && (
        <ShareModal
          projectName={projects.find((p) => p.id === projectId)?.name ?? "Project"}
          onShare={shareCurrentProject}
          onClose={() => setShareOpen(false)}
        />
      )}
      {referralOpen && authEmail && (
        <ReferralModal email={authEmail} onClose={() => setReferralOpen(false)} />
      )}
      {findOpen && doc && (
        <FindReplaceModal
          doc={doc}
          onApply={(next, count) => {
            mutate(next, `Find & replace (${count} changes)`, "edit");
            showToast(`Replaced ${count} occurrence${count === 1 ? "" : "s"}`);
          }}
          onClose={() => setFindOpen(false)}
        />
      )}

      <div className="app-main">
        <LeftRail
          doc={doc ?? emptyBlueprint()}
          pageIdx={pageIdx}
          selected={selected}
          onSelectPage={(i) => {
            setPageIdx(i);
            setSelected(null);
          }}
          onSelectSection={selectSection}
          onRemoveSection={removeSection}
          onAddSection={addSection}
          onAddSectionTemplate={addSectionTemplate}
          onMoveSection={moveSection}
        />

        <div className="preview-area" ref={previewAreaRef}>
          <div className="preview-toolbar">
            <button className={`toggle${editMode ? " on" : ""}`} onClick={() => setEditMode((v) => !v)}>
              <span className="preview-dot" />
              {editMode ? "Editing — click text to edit, drag to reorder" : "Edit mode"}
            </button>
            <div className="device-switcher">
              {(["desktop", "tablet", "mobile"] as const).map((d) => (
                <button key={d} className={`btn btn-sm ${device === d ? "btn-primary" : ""}`} onClick={() => setDevice(d)}>
                  {d}
                </button>
              ))}
            </div>
            <div className="device-switcher">
              <button className={`btn btn-sm ${fit ? "btn-primary" : ""}`} onClick={() => setFit(true)} title="Fit preview to width">
                Fit
              </button>
              <button className={`btn btn-sm ${!fit ? "btn-primary" : ""}`} onClick={() => setFit(false)} title="Actual pixel size">
                100%
              </button>
            </div>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                if (doc) {
                  void publishPreview(doc);
                  showToast("Opened in browser");
                }
              }}
              title="Open your design in a real browser tab"
            >
              ↗ View in browser
            </button>
            <button
              className="btn btn-sm"
              onClick={() => setView("full")}
              title="See your site full-screen, exactly as visitors will"
            >
              ⛶ Full view
            </button>
            <button className="btn btn-sm" onClick={toggleFullscreen} title="Fullscreen preview">
              ⛶
            </button>
            <span style={{ fontSize: 12, color: "var(--chrome-faint)" }}>{page?.title ?? ""}</span>
            <span style={{ flex: 1 }} />
            {hasPages && doc && (
              <select
                style={{ width: "auto" }}
                value={pageIdx}
                onChange={(e) => {
                  setPageIdx(Number(e.target.value));
                  setSelected(null);
                }}
              >
                {doc.pages.map((pg, i) => (
                  <option key={pg.id} value={i}>
                    {pg.title || pg.slug || "Home"}
                  </option>
                ))}
              </select>
            )}
          </div>

          {hasPages && doc ? (
            <Preview
              doc={doc}
              pageIdx={pageIdx}
              device={device}
              editMode={editMode}
              onInspect={selectSection}
              onNavClick={(slug) => {
                const idx = doc.pages.findIndex((p) => p.slug === slug);
                if (idx >= 0) {
                setPageIdx(idx);
                  setSelected(null);
                }
              }}
              onMoveSection={moveSection}
              onFieldEdit={handleFieldEdit}
              onImageField={(path) => void handleImageField(path)}
              onInsertAt={handleInsertAt}
              busy={busy}
              fit={fit}
            />
          ) : (
            <div className="preview-empty brief-wrap">
              <BriefScreen
                busy={busy}
                tier={proTier}
                onBuild={startBuild}
                onDemo={loadDemo}
                onBrowseTemplates={newProject}
                onUpgrade={() => setPricingOpen(true)}
              />
            </div>
          )}
        </div>

        <div className="right-panel">
          <div className="tabs">
            <button className={`tab${tab === "chat" ? " active" : ""}`} onClick={() => setTab("chat")}>Chat</button>
            <button className={`tab${tab === "design" ? " active" : ""}`} onClick={() => setTab("design")}>Design</button>
            <button className={`tab${tab === "media" ? " active" : ""}`} onClick={() => setTab("media")}>Media</button>
            <button className={`tab${tab === "code" ? " active" : ""}`} onClick={() => setTab("code")}>Code</button>
            <button className={`tab${tab === "inspect" ? " active" : ""}`} onClick={() => setTab("inspect")}>
              Inspect{selected ? <span className="tab-badge">•</span> : null}
            </button>
            <button className={`tab${tab === "plan" ? " active" : ""}`} onClick={() => setTab("plan")}>
              Plan{plan ? <span className="tab-badge">1</span> : null}
            </button>
            <button className={`tab${tab === "history" ? " active" : ""}`} onClick={() => setTab("history")}>History</button>
            <button className={`tab${tab === "posts" ? " active" : ""}`} onClick={() => setTab("posts")}>
              Posts{doc?.posts?.length ? <span className="tab-badge">{doc.posts.length}</span> : null}
            </button>
            <button className={`tab${tab === "pages" ? " active" : ""}`} onClick={() => setTab("pages")}>
              Pages{doc && doc.pages.length > 1 ? <span className="tab-badge">{doc.pages.length}</span> : null}
            </button>
            <button className={`tab${tab === "langs" ? " active" : ""}`} onClick={() => setTab("langs")}>Lang</button>
            <button className={`tab${tab === "seo" ? " active" : ""}`} onClick={() => setTab("seo")}>SEO</button>
            <button className={`tab${tab === "analytics" ? " active" : ""}`} onClick={() => setTab("analytics")}>Analytics</button>
          </div>

          <div className="panel-body">
            {tab === "chat" && (
              <Chat
                messages={messages}
                busy={busy}
                onDiscuss={discussQuestion}
                onSendInstruction={chatSend}
                onClear={() => setMessages([])}
              />
            )}
            {tab === "design" && doc && (
              <DesignPanel
                doc={doc}
                onSetVoice={setVoice}
                onApplyPreset={applyPreset}
                onUploadBrand={uploadBrand}
                onSetTone={setTone}
                onHarmonize={harmonizeDesign}
                onOpenThemes={() => setThemesOpen(true)}
                onOpenVariants={() => setVariantsOpen(true)}
              />
            )}
            {tab === "media" && (
              <MediaView assets={assets} onUpload={uploadMedia} onSelect={() => {}} onInsert={(a) => insertMedia(a.dataUrl, selected ? fieldPathForSelected(doc, selected) : "image")} onDelete={deleteMedia} onGenerate={generateMediaImage} busy={imgBusy} />
            )}
            {tab === "code" && doc && (
              <CodeView doc={doc} pageIdx={pageIdx} />
            )}
            {tab === "inspect" && doc && selected && (
              <Inspector
                doc={doc}
                pageIdx={selected.p}
                selected={selected}
                onChange={changeSectionContent}
                onMotion={setSectionMotion}
                onRemove={removeSection}
                onRegenerate={rewriteSection}
                onRewriteField={rewriteField}
                onUploadMedia={uploadMedia}
                onGenerateImage={generateSectionImage}
                onDuplicate={duplicateSection}
                onCopy={copySection}
                onPaste={pasteSection}
                hasClipboard={Boolean(clipboard)}
                mediaAssets={assets}
                onInsertMedia={insertMedia}
                busy={busy}
                busyLabel={busyLabel}
              />
            )}
            {tab === "inspect" && (!doc || !selected) && (
              <div className="settings-note">Turn on Edit mode and click any section of the preview, or pick a section in the left rail, to edit its content directly — free and instant.</div>
            )}
            {tab === "plan" && <PlanView plan={plan} busy={busy} onApprove={approvePlan} onDiscard={discardPlan} />}
            {tab === "history" && (
              <HistoryView
                history={history}
                cursor={cursor}
                onRestore={restore}
                cloudHistory={cloudHistory}
                onRestoreCloud={restoreCloudVersion}
              />
            )}
            {tab === "posts" && doc && (
              <PostsView
                posts={doc.posts ?? []}
                onChange={(posts) => mutate({ ...doc, posts }, "Updated blog posts", "manual")}
                onGenerateImage={async () => generateMediaImageForPost()}
                onGeneratePosts={generatePosts}
                busy={busy}
              />
            )}
            {tab === "langs" && doc && (
              <LanguagesView doc={doc} onChange={updateDoc} onTranslateAll={translateAllFor} busy={busy} />
            )}
            {tab === "pages" && doc && (
              <>
                <PagesManager
                  doc={doc}
                  pageIdx={pageIdx}
                  onSelectPage={(i) => {
                    setPageIdx(i);
                    setSelected(null);
                  }}
                  onAddPage={addPage}
                  onRenamePage={renamePage}
                  onDeletePage={deletePage}
                />
                <button className="btn" style={{ width: "100%", marginTop: 6 }} onClick={() => setFindOpen(true)}>
                  Find & replace
                </button>
              </>
            )}
            {tab === "seo" && doc && (
              <SeoPanel
                doc={doc}
                settings={settings}
                busy={busy}
                onStatus={(l) => setBusyLabel(l)}
                onApplyDoc={(d, label, source) => mutate(d, label, source)}
                onGenerateOg={generateOgImage}
                onFillAlt={fillAlts}
              />
            )}
            {tab === "analytics" && doc && (
              <AnalyticsView doc={doc} onApplyDoc={(d, label, source) => mutate(d, label, source)} />
            )}
          </div>
        </div>
      </div>

      <StatusFooter busy={busy} busyLabel={busyLabel} error={error} hasPages={hasPages} doc={doc} settings={settings} history={history} />

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          siteMeta={{
            password: doc?.password,
            stripePaymentLink: doc?.stripePaymentLink,
            embedHead: doc?.embeds?.head?.[0],
            embedBody: doc?.embeds?.body?.[0],
            formEndpoint: doc?.forms?.endpoint,
            analyticsDomain: doc?.analytics ? (doc.analytics.plausible ?? doc.analytics.goatcounter ?? "") : "",
            cookieEnabled: doc?.cookieConsent?.enabled,
            cookieText: doc?.cookieConsent?.text,
            cookiePolicyUrl: doc?.cookieConsent?.policyUrl,
            redirects: (doc?.redirects ?? []).map((r) => `${r.from} → ${r.to}`).join("\n"),
            themeToggle: doc?.theme?.toggle,
            themeDefaultMode: doc?.theme?.defaultMode ?? "auto",
            siteUrl: doc?.meta.siteUrl,
            stickyNav: doc?.nav?.sticky,
            announcementText: doc?.announcement?.text,
            announcementHref: doc?.announcement?.href,
            popupEnabled: doc?.popup?.enabled,
            popupTitle: doc?.popup?.title,
            popupText: doc?.popup?.text,
            popupButtonLabel: doc?.popup?.buttonLabel,
            popupCtaUrl: doc?.popup?.ctaUrl,
            popupDelaySec: doc?.popup?.delaySec,
            popupTrigger: doc?.popup?.trigger,
            popupScrollPct: doc?.popup?.scrollPct,
            customFonts: (doc?.customFonts ?? []).map((f) => `${f.name} ${f.url}${f.weight ? ` ${f.weight}` : ""}`).join("\n"),
            emailServiceProvider: doc?.forms?.emailService?.provider ?? "",
            emailServiceEndpoint: doc?.forms?.emailService?.endpoint ?? "",
            emailServiceApiKey: doc?.forms?.emailService?.apiKey ?? "",
            emailServiceListId: doc?.forms?.emailService?.listId ?? "",
            coupons: (doc?.coupons ?? []).map((c) => `${c.code} ${c.percentOff}`).join("\n"),
            orderNotify: doc?.orderNotify ?? "",
            maintenanceEnabled: doc?.maintenance?.enabled,
            maintenanceTitle: doc?.maintenance?.title,
            maintenanceText: doc?.maintenance?.text,
            maintenanceEmail: doc?.maintenance?.email,
          }}
          cloudOn={cloudOn}
          signedIn={Boolean(authUid)}
          onSave={saveSettingsCb}
          onSaveSiteMeta={saveSiteMeta}
          onToggleCloud={toggleCloud}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onSelectSection={(p, s) => {
          setSelected({ p, s });
          setTab("inspect");
        }}
        actions={cmdActions}
      />

      {toast && <div className="toast">{toast}</div>}
      {insertAt && (
        <div className="modal-overlay" onClick={() => setInsertAt(null)}>
          <div className="modal insert-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Insert section</h3>
            <div className="insert-grid">
              {SECTION_TYPES.map((st) => (
                <button key={st.type} className="btn btn-sm" onClick={() => insertSection(st.type)}>
                  {st.label}
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setInsertAt(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {starterOpen && <StarterGallery onPick={pickStarter} onClose={() => setStarterOpen(false)} />}
      {pricingOpen && (
        <PricingModal
          onClose={() => setPricingOpen(false)}
          onBuy={buyPro}
          configured={Boolean(paymentLink())}
          pro={pro}
          tier={proTier}
          signedIn={Boolean(authUid)}
          email={authEmail}
          projectCount={projects.length}
          onOpenAccount={() => {
            setPricingOpen(false);
            setAuthOpen(true);
          }}
        />
      )}
      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} />}
      {themesOpen && (
        <ThemeGallery
          tier={proTier}
          onApply={applyGeneratedTheme}
          onUpgrade={() => {
            setThemesOpen(false);
            setPricingOpen(true);
          }}
          onClose={() => setThemesOpen(false)}
        />
      )}
      {variantsOpen && doc && (
        <VariantsModal
          current={doc.design}
          tier={proTier}
          onApply={applyVariantDesign}
          onUpgrade={() => {
            setVariantsOpen(false);
            setPricingOpen(true);
          }}
          onClose={() => setVariantsOpen(false)}
        />
      )}
      <OnboardingTour
        active={tourOpen}
        steps={tourSteps}
        onClose={() => setTourOpen(false)}
        onTurnOff={() => turnOffTour()}
      />
      {gateOpen && <AuthGate onClose={() => setGateOpen(false)} />}
      {view === "full" && doc && (
        <FullView
          doc={doc}
          tier={proTier}
          busy={busy}
          live={live}
          onGoLive={goLive}
          onEnterEditor={() => setView("editor")}
          onOpenTab={() => {
            void publishPreview(doc);
            showToast("Opened in a new tab");
          }}
        />
      )}
    </div>
  );
}

function StatusFooter({ busy, busyLabel, error, hasPages, doc, settings, history }: { busy: boolean; busyLabel: string; error: string | null; hasPages: boolean; doc: SiteBlueprint | null; settings: LLMSettings & { githubToken?: string }; history: Checkpoint[] }) {
  return (
    <div className="status-bar">
      <span className={`status-dot ${busy ? "busy" : error ? "err" : hasPages ? "ok" : "warn"}`} />
      <span>
        {busy ? busyLabel : error ? error : hasPages ? `${doc?.pages.length ?? 0} page${(doc?.pages.length ?? 1) > 1 ? "s" : ""} · ${doc?.design.name ?? ""} design system` : "No site yet — describe one to begin"}
      </span>
      <span className="right">
        <span>{history.length} checkpoint{(history.length === 1 ? "" : "s")} · Ctrl+Z to undo</span>
        <span>{settings.provider}{settings.model ? ` · ${settings.model}` : ""}{settings.apiKey ? "" : " · no key"}</span>
      </span>
    </div>
  );
}

function fieldPathForSelected(doc: SiteBlueprint | null, sel: { p: number; s: number }): string {
  const page = doc?.pages[sel.p];
  const sec = page?.sections[sel.s];
  if (!sec) return "image";
  const content = sec.content as Record<string, unknown>;
  if (content.image && typeof content.image === "object") return "image.url";
  if (content.photo) return "photo";
  if (content.logo) return "logo";
  return "image";
}

function setContentByPath(doc: SiteBlueprint, p: number, s: number, path: string, value: string): SectionContent[SectionType] {
  const next = JSON.parse(JSON.stringify(doc.pages[p].sections[s].content)) as Record<string, unknown>;
  setField(next, path, value);
  return next as SectionContent[SectionType];
}
