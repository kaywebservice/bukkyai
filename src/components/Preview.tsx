import { useEffect, useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import type { SiteBlueprint } from "../lib/types";
import { renderPage } from "../lib/render";
import { DEVICE } from "../lib/types";

type Props = {
  doc: SiteBlueprint;
  pageIdx: number;
  device: keyof typeof DEVICE;
  editMode: boolean;
  onInspect: (p: number, s: number) => void;
  onNavClick: (slug: string) => void;
  onMoveSection: (fromP: number, fromS: number, toP: number, toS: number) => void;
  onFieldEdit: (path: string, value: string) => void;
  onImageField: (path: string) => void;
  onInsertAt: (p: number, s: number) => void;
  busy: boolean;
  fit?: boolean;
};

const INJECT = `
*{transition:none!important}
html,body{margin:0;background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,sans-serif}
[data-secidx]{cursor:pointer!important}
[data-secidx]:hover{outline:2px solid #3b82f6;outline-offset:2px}
.busybadge{position:fixed;top:10px;right:10px;background:#1e293b;color:#fff;font-size:11px;padding:3px 8px;border-radius:4px;z-index:9999}
.bk-grip{position:absolute;top:10px;left:10px;z-index:20;width:26px;height:26px;border-radius:6px;background:#3b82f6;color:#fff;font-size:14px;line-height:26px;text-align:center;cursor:grab;opacity:0;transition:opacity .15s;font-family:system-ui}
.bk-section{position:relative}
.bk-section:hover>.bk-grip{opacity:1}
.bk-add-sec{display:block;margin:0 auto;width:34px;height:22px;border:0;border-radius:0 0 8px 8px;background:#3b82f6;color:#fff;font-size:14px;line-height:22px;cursor:pointer;opacity:.85}
.bk-drag-over{outline:2px dashed #3b82f6!important}
[contenteditable="true"]{outline:2px solid #3b82f6!important;border-radius:3px;cursor:text;min-width:1em}
[data-bkimg]{cursor:pointer!important}
[data-bkimg]:hover{outline:2px solid #3b82f6!important}
`;

const EDITOR_SCRIPT = `(function () {
  function secIdx(el) {
    var sec = el.closest ? el.closest(".bk-section") : null;
    if (!sec) return null;
    return { p: Number(sec.getAttribute("data-page")), s: Number(sec.getAttribute("data-secidx")) };
  }
  // Grip handles + add-section buttons
  function decorate() {
    document.querySelectorAll(".bk-section[data-secidx]").forEach(function (sec) {
      if (sec.querySelector(".bk-grip")) return;
      var grip = document.createElement("div");
      grip.className = "bk-grip";
      grip.textContent = "⋮⋮";
      grip.title = "Drag to reorder";
      sec.appendChild(grip);
      var add = document.createElement("button");
      add.className = "bk-add-sec";
      add.textContent = "+";
      add.title = "Insert section below";
      add.addEventListener("click", function (e) {
        e.stopPropagation();
        var idx = secIdx(sec);
        if (idx) window.parent.postMessage({ type: "bk:insert", p: idx.p, s: idx.s + 1 }, "*");
      });
      sec.appendChild(add);
    });
  }
  decorate();
  // Drag reorder
  var dragging = null;
  var overEl = null;
  document.addEventListener("mousedown", function (e) {
    var grip = e.target.closest ? e.target.closest(".bk-grip") : null;
    if (!grip) return;
    e.preventDefault();
    var idx = secIdx(grip);
    if (idx) dragging = idx;
  });
  document.addEventListener("mousemove", function (e) {
    if (!dragging) return;
    if (overEl) overEl.classList.remove("bk-drag-over");
    var sec = e.target.closest ? e.target.closest(".bk-section") : null;
    overEl = sec || null;
    if (overEl) overEl.classList.add("bk-drag-over");
  });
  document.addEventListener("mouseup", function (e) {
    if (!dragging) return;
    if (overEl) overEl.classList.remove("bk-drag-over");
    var target = secIdx(e.target);
    if (target && !(target.p === dragging.p && target.s === dragging.s)) {
      window.parent.postMessage({ type: "bk:move", from: dragging, to: target }, "*");
    }
    dragging = null;
    overEl = null;
  });
  // Inline text editing
  document.addEventListener("focusin", function (e) {
    var el = e.target;
    if (!el || !el.hasAttribute || !el.hasAttribute("data-field")) return;
    if (el.getAttribute("contenteditable") === "true") return;
    if (!el.getAttribute("data-field")) return;
    el.setAttribute("contenteditable", "true");
    el.setAttribute("data-orig", el.textContent);
    var done = false;
    var save = function () {
      if (done) return;
      done = true;
      var val = el.textContent;
      var orig = el.getAttribute("data-orig") || "";
      if (val !== orig) {
        window.parent.postMessage({ type: "bk:field", path: el.getAttribute("data-field"), value: val }, "*");
      }
      el.removeAttribute("contenteditable");
    };
    el.addEventListener("blur", save, { once: true });
    el.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); el.blur(); }
      if (ev.key === "Escape") { el.textContent = el.getAttribute("data-orig") || ""; el.blur(); }
    });
    setTimeout(function () { el.focus(); }, 0);
  });
  // Image replace
  document.addEventListener("click", function (e) {
    var img = e.target.closest ? e.target.closest("[data-bkimg]") : null;
    if (img) {
      e.preventDefault();
      e.stopPropagation();
      var path = img.getAttribute("data-bkimg");
      if (path) window.parent.postMessage({ type: "bk:image", path: path }, "*");
      return;
    }
  });
})();`;

export default function Preview(p: Props) {
  const page = p.doc.pages[p.pageIdx];
  const html = page ? renderPage(p.doc, page, p.editMode) : "<!doctype html><title>Kaywebservice</title>";
  const editorInj = p.editMode ? `<script>${EDITOR_SCRIPT}</script>` : "";
  const srcDoc = html.replace(/<\/head>/, `<style>${INJECT}</style></head>`).replace(/<\/body>/, `${editorInj}</body>`);
  const wrapWidth = DEVICE[p.device];

  const handleNav = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
    if (anchor) {
      e.preventDefault();
      const href = anchor.getAttribute("href") || "";
      if (href.startsWith("#bkpage:")) {
        const slug = href.slice("#bkpage:".length);
        if (slug) p.onNavClick(slug);
        return;
      }
      if (href.startsWith("#") || href.startsWith("?")) return;
      if (/^[a-z]+:/i.test(href)) {
        if (/^https?:|^mailto:|^tel:/i.test(href)) window.open(href, "_blank", "noopener");
        return;
      }
      const slug = href.replace(/^\//, "");
      p.onNavClick(slug);
      return;
    }
    const sec = target.closest("[data-secidx]") as HTMLElement | null;
    if (sec) {
      const idx = Number(sec.getAttribute("data-secidx"));
      if (!isNaN(idx)) {
        e.preventDefault();
        p.onInspect(p.pageIdx, idx);
      }
    }
  };

  const onLoad = (e: SyntheticEvent<HTMLIFrameElement>) => {
    const d = (e.currentTarget.contentDocument || e.currentTarget.contentWindow?.document) as Document | null;
    if (d) d.addEventListener("click", handleNav, true);
  };

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const m = e.data as { type?: string; path?: string; value?: string; from?: { p: number; s: number }; to?: { p: number; s: number }; p?: number; s?: number } | undefined;
      if (!m || !m.type || !m.type.startsWith("bk:")) return;
      if (m.type === "bk:field" && m.path && typeof m.value === "string") p.onFieldEdit(m.path, m.value);
      else if (m.type === "bk:move" && m.from && m.to) p.onMoveSection(m.from.p, m.from.s, m.to.p, m.to.s);
      else if (m.type === "bk:image" && m.path) p.onImageField(m.path);
      else if (m.type === "bk:insert" && typeof m.p === "number" && typeof m.s === "number") p.onInsertAt(m.p, m.s);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p]);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [avail, setAvail] = useState(0);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAvail(Math.max(0, el.clientWidth - 40)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const width = p.fit === false ? wrapWidth : Math.max(240, Math.min(wrapWidth, avail || wrapWidth));

  return (
    <div className="preview-area-inner" ref={wrapRef}>
      {p.busy && <div className="busybadge">AI…</div>}
      <div className="preview-frame" style={{ width }}>
        <iframe title={page?.slug ?? "preview"} srcDoc={srcDoc} onLoad={onLoad} />
      </div>
    </div>
  );
}
