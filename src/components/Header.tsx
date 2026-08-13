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
  onShare?: () => void;
  invites?: number;
  onAcceptInvites?: () => void;
  onHelp?: () => void;
  presence?: { name: string }[];
};

export default function Header(p: Props) {
  const [exportOpen, setExportOpen] = useState(false);
  const [user, setUser] = useState<{ email: string | null; name: string | null; photo: string | null } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authConfigured()) return;
    const unsub = onAuthChange((u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="header">
      <div className="brand">
        <span className="brand-mark">b</span>
        <span>bukkyai</span>
      </div>

      <div className="project-picker">
        <select
          className="project-select"
          value={p.activeId ?? ""}
          onChange={(e) => p.onSelectProject(e.target.value)}
        >
          <option value="" disabled>
            Select project…
          </option>
          {p.projects.map((pr) => (
            <option key={pr.id} value={pr.id}>
              {pr.name}
            </option>
          ))}
        </select>
        <button
          className="btn btn-sm btn-ghost"
          onClick={p.onRenameProject}
          title="Rename the active project"
          disabled={!p.activeId}
        >
          ✎
        </button>
        <button
          className="btn btn-sm btn-ghost"
          onClick={p.onDuplicateProject}
          title="Duplicate the active project"
          disabled={!p.activeId}
        >
          ⧉
        </button>
        <button
          className="btn btn-sm btn-ghost"
          onClick={p.onDeleteProject}
          title="Delete the active project"
          disabled={!p.activeId}
        >
          ✕
        </button>
        <button className="btn btn-sm" onClick={p.onNewProject} title="New project">
          + New
        </button>
        <button className="btn btn-sm btn-ghost" onClick={p.onDemo} title="Load the built-in demo site">
          Demo
        </button>
        <label className="btn btn-sm btn-ghost" title="Import a saved blueprint JSON">
          Import
          <input type="file" accept=".json,application/json" hidden onChange={(e) => {
            const f = e.target.files?.[0]; e.target.value = ""; if (f) p.onImport(f);
          }}/>
        </label>
      </div>

      <div className="header-spacer" />

      {p.busy && (
        <div className="busy-pill">
          <span className="spinner" />
          {p.busyLabel || "Working…"}
        </div>
      )}

      <button className="btn" onClick={p.onSnapshot} title="Save a labeled checkpoint now" disabled={p.busy}>
        Snapshot
      </button>

      <div className="export-menu" ref={ref}>
        <button className="btn" onClick={() => setExportOpen((v) => !v)} disabled={p.busy}>
          Export
        </button>
        {exportOpen && (
          <div className="export-pop">
            <button onClick={() => { p.onExportZip(); setExportOpen(false); }}>
              <span className="pop-title">Site (.zip)</span>
              <span className="pop-desc">HTML + robots + sitemap + README — host anywhere</span>
            </button>
            <button onClick={() => { p.onExportReact(); setExportOpen(false); }}>
              <span className="pop-title">React project (.zip)</span>
              <span className="pop-desc">Vite + React site you can open in VS Code and keep developing</span>
            </button>
            <button onClick={() => { p.onExportCms(); setExportOpen(false); }}>
              <span className="pop-title">CMS export (.zip)</span>
              <span className="pop-desc">Markdown + JSON blocks for WordPress/Webflow</span>
            </button>
            <button onClick={() => { p.onExportSingle(); setExportOpen(false); }}>
              <span className="pop-title">Single-file HTML</span>
              <span className="pop-desc">One self-contained page, all CSS inline</span>
            </button>
            <button onClick={() => { p.onBlueprintJson?.(); setExportOpen(false); }}>
              <span className="pop-title">Blueprint JSON</span>
              <span className="pop-desc">The full editable document — open format, open forever</span>
            </button>
            <button onClick={() => { p.onPrintPlan?.(); setExportOpen(false); }}>
              <span className="pop-title">Print site plan (PDF)</span>
              <span className="pop-desc">A print-ready summary — save it from the print dialog</span>
            </button>
            <button onClick={() => { p.onPublishPreview(); setExportOpen(false); }}>
              <span className="pop-title">Publish preview</span>
              <span className="pop-desc">Open the live single-file site in a new tab</span>
            </button>
            <button onClick={() => { p.onGithubBackup(); setExportOpen(false); }}>
              <span className="pop-title">Back up to GitHub</span>
              <span className="pop-desc">Save a private gist (needs a token in Settings)</span>
            </button>
            <button onClick={() => { p.onDeploy(); setExportOpen(false); }}>
              <span className="pop-title">Deploy to GitHub Pages</span>
              <span className="pop-desc">Push this site live at yourname.github.io (needs a token in Settings)</span>
            </button>
            <button onClick={() => { p.onPublish(); setExportOpen(false); }}>
              <span className="pop-title">Publish &amp; share</span>
              <span className="pop-desc">Get a shareable link (Pro, via the publish worker)</span>
            </button>
          </div>
        )}
      </div>

      <button className="btn" onClick={p.onOpenSettings} title="Settings">
        Settings
      </button>
      {p.onHelp && (
        <button className="btn btn-ghost" onClick={p.onHelp} title="Guided tour">
          Help
        </button>
      )}
      {p.presence && p.presence.length > 0 && (
        <span className="presence-chip" title={`Editing now: ${p.presence.map((u) => u.name).join(", ")}`}>
          <span className="presence-dot" />
          {p.presence.map((u) => u.name.slice(0, 1).toUpperCase()).join("")}
        </span>
      )}
      {p.onShare && (
        <button className="btn btn-ghost" onClick={p.onShare} title="Share the active project">
          Share
        </button>
      )}
      {p.onAcceptInvites && p.invites ? (
        <button className="btn btn-ghost" onClick={p.onAcceptInvites} title={`${p.invites} pending invite${p.invites > 1 ? "s" : ""}`}>
          Invites ({p.invites})
        </button>
      ) : null}
      <button className="btn btn-ghost" onClick={p.onPricing} title="Pricing">
        Pricing
      </button>
      <InstallAppButton />
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
  );
}
