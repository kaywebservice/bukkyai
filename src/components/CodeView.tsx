import { renderCss } from "../lib/renderCss";
import { renderPage } from "../lib/render";
import type { Page, SiteBlueprint } from "../lib/types";
import { useState } from "react";

type Props = { doc: SiteBlueprint; pageIdx: number };

export default function CodeView(p: Props) {
  const [tab, setTab] = useState<"html" | "css">("html");
  const page: Page | undefined = p.doc.pages[p.pageIdx];
  const html = page ? renderPage(p.doc, page, false) : "<html><body></body></html>";
  const css = renderCss(p.doc);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <>
      <div className="panel-label">Live code</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        <button className={`btn btn-sm ${tab === "html" ? "btn-primary" : ""}`} onClick={() => setTab("html")}>
          page.{page?.slug ? page.slug : "html"}
        </button>
        <button className={`btn btn-sm ${tab === "css" ? "btn-primary" : ""}`} onClick={() => setTab("css")}>
          design.css
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => copy(tab === "html" ? html : css)}>
          Copy
        </button>
      </div>
      <pre style={{
        background: "#0d0d10",
        borderRadius: 10,
        padding: 14,
        fontSize: 11.5,
        lineHeight: 1.45,
        overflow: "auto",
        color: "#d4d4d4",
        border: "1px solid var(--chrome-border)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        maxHeight: "60vh",
      }}>{tab === "html" ? html : css}</pre>
      <div className="settings-note" style={{ marginTop: 10 }}>
        This is real server-rendered HTML generated from your blueprint — deterministic, not AI-written, so it
        never breaks. In a production codebase this is the exact file you'd deploy.
      </div>
    </>
  );
}
