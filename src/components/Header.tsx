import { useEffect, useRef, useState } from "react";
import type { ProjectMeta } from "../lib/store";
import { authConfigured, onAuthChange } from "../lib/auth";
import InstallAppButton from "./InstallAppButton";

type Props = {
  projects: ProjectMeta[];
  activeId: string | null;
  busy: boolean;
  busyLabel: string;
  onSelectProject: (id: string) => void;
  onDeleteProject: () => void;
  onRenameProject: () => void;
  onDuplicateProject: () => void;
  onNewProject: () => void;
  onDemo: () => void;
  onImport: (file: File) => void;
  onSnapshot: () => void;
  onExportZip: () => void;
  onExportSingle: () => void;
  onExportReact: () => void;
  onExportCms: () => void;
  onBlueprintJson?: () => void;
  onPrintPlan?: () => void;
  onPublishPreview: () => void;
  onGithubBackup: () => void;
  onDeploy: () => void;
  onPublish: () => void;
  onOpenSettings: () => void;
  onAuth: () => void;
  onPricing: () => void;
  onOpenPanel: (tab: string) => void;
  onAddSection: () => void;
  onFullView: () => void;
  onShare?: () => void;
  onReferral?: () => void;
  invites?: number;
  onAcceptInvites?: () => void;
  onHelp?: () => void;
  presence?: { name: string }[];
};

export default function Header(p: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email: string | null; name: string | null; photo: string | null } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authConfigured()) return;
    const unsub = onAuthChange((u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <div className="header">
      <div className="brand">
        <span className="brand-mark">b</span>
        <span>bukkyai</span>
      </div>

      <div className="header-spacer" />

      <div className="header-actions">
        {p.busy && (
          <div className="busy-pill">
            <span className="spinner" />
            {p.busyLabel || "Working…"}
          </div>
        )}
        {p.presence && p.presence.length > 0 && (
          <span className="presence-chip" title={`Editing now: ${p.presence.map((u) => u.name).join(", ")}`}>
            <span className="presence-dot" />
            {p.presence.map((u) => u.name.slice(0, 1).toUpperCase()).join("")}
          </span>
        )}
        <div className="more-menu" ref={menuRef}>
          <button className="btn" onClick={() => setMenuOpen((v) => !v)} title="Menu" aria-label="Menu">
            ☰ Menu
          </button>
          {menuOpen && (
            <div className="more-pop menu-pop">
              <div className="menu-group">
                <div className="menu-label">Publish &amp; export</div>
                <button onClick={() => { p.onPublish(); close(); }} disabled={p.busy}>
                  <span className="pop-title">Publish &amp; share</span>
                  <span className="pop-desc">Get a shareable link (Pro, via the publish worker)</span>
                </button>
                <button onClick={() => { p.onExportZip(); close(); }}>
                  <span className="pop-title">Export site (.zip)</span>
                  <span className="pop-desc">HTML + robots + sitemap + README — host anywhere</span>
                </button>
                <button onClick={() => { p.onExportSingle(); close(); }}>
                  <span className="pop-title">Export single-file HTML</span>
                  <span className="pop-desc">One self-contained page, all CSS inline</span>
                </button>
                <button onClick={() => { p.onExportReact(); close(); }}>
                  <span className="pop-title">Export React project (.zip)</span>
                  <span className="pop-desc">Vite + React site you can keep developing</span>
                </button>
                <button onClick={() => { p.onExportCms(); close(); }}>
                  <span className="pop-title">Export CMS (.zip)</span>
                  <span className="pop-desc">Markdown + JSON blocks for WordPress/Webflow</span>
                </button>
                <button onClick={() => { p.onBlueprintJson?.(); close(); }}>
                  <span className="pop-title">Export blueprint JSON</span>
                  <span className="pop-desc">The full editable document — open forever</span>
                </button>
                <button onClick={() => { p.onPrintPlan?.(); close(); }}>
                  <span className="pop-title">Print site plan (PDF)</span>
                  <span className="pop-desc">A print-ready summary</span>
                </button>
                <button onClick={() => { p.onPublishPreview(); close(); }}>
                  <span className="pop-title">Open preview in tab</span>
                  <span className="pop-desc">The live single-file site in a new tab</span>
                </button>
                <button onClick={() => { p.onGithubBackup(); close(); }}>
                  <span className="pop-title">Back up to GitHub</span>
                  <span className="pop-desc">Save a private gist (token in Settings)</span>
                </button>
                <button onClick={() => { p.onDeploy(); close(); }}>
                  <span className="pop-title">Deploy to GitHub Pages</span>
                  <span className="pop-desc">Live at yourname.github.io (token in Settings)</span>
                </button>
              </div>
              <div className="menu-group">
                <div className="menu-label">Projects</div>
                <button onClick={() => { p.onNewProject(); close(); }}>
                  <span className="pop-title">New project (templates)</span>
                  <span className="pop-desc">Start from a template or a blank canvas</span>
                </button>
                {p.projects.map((pr) => (
                  <button
                    key={pr.id}
                    className={`menu-project${pr.id === p.activeId ? " on" : ""}`}
                    onClick={() => { p.onSelectProject(pr.id); close(); }}
                  >
                    <span className="pop-title">{pr.name}</span>
                    <span className="pop-desc">{pr.id === p.activeId ? "Currently open" : "Open this project"}</span>
                  </button>
                ))}
                <button onClick={() => { p.onRenameProject(); close(); }} disabled={!p.activeId}>
                  <span className="pop-title">Rename project…</span>
                  <span className="pop-desc">{p.activeId ? "Rename the open project" : "No project open"}</span>
                </button>
                <button onClick={() => { p.onDuplicateProject(); close(); }} disabled={!p.activeId}>
                  <span className="pop-title">Duplicate project</span>
                  <span className="pop-desc">{p.activeId ? "Copy the open project" : "No project open"}</span>
                </button>
                <button onClick={() => { p.onDeleteProject(); close(); }} disabled={!p.activeId}>
                  <span className="pop-title">Delete project</span>
                  <span className="pop-desc">{p.activeId ? "Permanently delete the open project" : "No project open"}</span>
                </button>
              </div>
              <div className="menu-group">
                <div className="menu-label">Editor tools</div>
                <button onClick={() => { p.onAddSection(); close(); }} disabled={!p.activeId}>
                  <span className="pop-title">Add section…</span>
                  <span className="pop-desc">Add a section to the open page</span>
                </button>
                <button onClick={() => { p.onOpenPanel("chat"); close(); }}>
                  <span className="pop-title">Chat &amp; AI</span>
                  <span className="pop-desc">Ask, instruct, discuss — the assistant</span>
                </button>
                <button onClick={() => { p.onOpenPanel("design"); close(); }}>
                  <span className="pop-title">Design</span>
                  <span className="pop-desc">Design system, themes, harmonize</span>
                </button>
                <button onClick={() => { p.onOpenPanel("media"); close(); }}>
                  <span className="pop-title">Media</span>
                  <span className="pop-desc">Upload images, generate with AI</span>
                </button>
                <button onClick={() => { p.onOpenPanel("code"); close(); }}>
                  <span className="pop-title">Code</span>
                  <span className="pop-desc">View / copy / download the HTML + CSS</span>
                </button>
                <button onClick={() => { p.onOpenPanel("inspect"); close(); }}>
                  <span className="pop-title">Inspect</span>
                  <span className="pop-desc">Element details of the selected part</span>
                </button>
                <button onClick={() => { p.onOpenPanel("plan"); close(); }}>
                  <span className="pop-title">Plan</span>
                  <span className="pop-desc">Sitemap and page plan</span>
                </button>
                <button onClick={() => { p.onOpenPanel("history"); close(); }}>
                  <span className="pop-title">History</span>
                  <span className="pop-desc">Undo any change, back to checkpoints</span>
                </button>
                <button onClick={() => { p.onOpenPanel("posts"); close(); }}>
                  <span className="pop-title">Posts</span>
                  <span className="pop-desc">Blog articles on your site</span>
                </button>
                <button onClick={() => { p.onOpenPanel("pages"); close(); }}>
                  <span className="pop-title">Pages</span>
                  <span className="pop-desc">Add, rename, delete pages</span>
                </button>
                <button onClick={() => { p.onOpenPanel("langs"); close(); }}>
                  <span className="pop-title">Translations</span>
                  <span className="pop-desc">Multi-language versions</span>
                </button>
                <button onClick={() => { p.onOpenPanel("seo"); close(); }}>
                  <span className="pop-title">SEO</span>
                  <span className="pop-desc">Quality score, meta, AI auto-fix</span>
                </button>
                <button onClick={() => { p.onOpenPanel("analytics"); close(); }}>
                  <span className="pop-title">Analytics</span>
                  <span className="pop-desc">Optional analytics scripts</span>
                </button>
                <button onClick={() => { p.onFullView(); close(); }}>
                  <span className="pop-title">Full view</span>
                  <span className="pop-desc">See the site full-screen, exactly as visitors will</span>
                </button>
              </div>
              <div className="menu-group">
                <div className="menu-label">Tools</div>
                <button onClick={() => { p.onOpenSettings(); close(); }}>
                  <span className="pop-title">Settings</span>
                  <span className="pop-desc">AI provider, API key, GitHub token</span>
                </button>
                {p.onShare && (
                  <button onClick={() => { p.onShare?.(); close(); }}>
                    <span className="pop-title">Share project</span>
                    <span className="pop-desc">Invite teammates or copy the link</span>
                  </button>
                )}
                <button onClick={() => { p.onSnapshot(); close(); }} disabled={p.busy}>
                  <span className="pop-title">Checkpoint</span>
                  <span className="pop-desc">Save a labeled snapshot to undo to later</span>
                </button>
                {p.onHelp && (
                  <button onClick={() => { p.onHelp?.(); close(); }}>
                    <span className="pop-title">Guided tour</span>
                    <span className="pop-desc">Walk through every feature</span>
                  </button>
                )}
                {p.onReferral && (
                  <button onClick={() => { p.onReferral?.(); close(); }}>
                    <span className="pop-title">Refer &amp; earn</span>
                    <span className="pop-desc">Share your link, earn free Pro time</span>
                  </button>
                )}
                <button onClick={() => { p.onDemo(); close(); }}>
                  <span className="pop-title">Load demo site</span>
                  <span className="pop-desc">Explore the built-in Northwind demo</span>
                </button>
                <label className="more-pop-label">
                  <span className="pop-title">Import project</span>
                  <span className="pop-desc">Open a saved blueprint (.json)</span>
                  <input type="file" accept=".json,application/json" hidden onChange={(e) => {
                    const f = e.target.files?.[0]; e.target.value = ""; if (f) p.onImport(f); close();
                  }} />
                </label>
                {p.onAcceptInvites && p.invites ? (
                  <button onClick={() => { p.onAcceptInvites?.(); close(); }}>
                    <span className="pop-title">Invites ({p.invites})</span>
                    <span className="pop-desc">Accept pending team invitations</span>
                  </button>
                ) : null}
                <button onClick={() => { p.onPricing(); close(); }}>
                  <span className="pop-title">Pricing &amp; upgrade</span>
                  <span className="pop-desc">Pro / Plus plans</span>
                </button>
                <span className="menu-install"><InstallAppButton /></span>
              </div>
              <div className="menu-group">
                <div className="menu-label">Account</div>
                <button onClick={() => { p.onAuth(); close(); }}>
                  <span className="pop-title">{user ? (user.name ?? user.email ?? "Account") : "Sign in / create account"}</span>
                  <span className="pop-desc">{user ? "Manage your account" : "Needed for Go live and sharing"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
        {user ? (
          <button className="auth-chip" onClick={p.onAuth} title="Account">
            {user.photo ? (
              <img src={user.photo} alt="" className="auth-avatar" />
            ) : (
              <span className="auth-avatar auth-avatar-fallback">{(user.name ?? user.email ?? "u").slice(0, 1).toUpperCase()}</span>
            )}
            <span className="auth-email">{user.name ?? user.email}</span>
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={p.onAuth} title="Sign in / account">
            Sign in
          </button>
        )}
      </div>
    </div>
  );
}