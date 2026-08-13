import type { SiteBlueprint } from "./types";
import { shade } from "./color";

export function renderCss(doc: SiteBlueprint): string {
  const t = doc.design.tokens;
  const c = t.colors;
  const f = t.fonts;
  const fs = t.fontScale;
  const sp = t.spacing;
  const rd = t.radius;
  const sh = t.shadows;
  const dur = t.motion.durationMs;

  const customFonts = (doc.customFonts ?? [])
    .map((f) => `@font-face{font-family:"${f.name.replace(/[^a-zA-Z0-9\s-]/g, "").trim()}";src:url("${f.url}") format("woff2");font-weight:${f.weight || "400"};font-style:${f.style || "normal"}}`)
    .join("\n");

  return `
${customFonts ? `${customFonts}\n` : ""}:root{
  --bg:${c.background}; --surface:${c.surface}; --text:${c.text}; --muted:${c.muted};
  --primary:${c.primary}; --primary-c:${c.primaryContrast}; --accent:${c.accent}; --accent-c:${c.accentContrast};
  --border:${c.border};
  --font-head:"${f.heading}",ui-serif,Georgia,serif; --font-body:"${f.body}",system-ui,-apple-system,sans-serif;
  --fs-display:${fs.display}px; --fs-h1:${fs.h1}px; --fs-h2:${fs.h2}px; --fs-h3:${fs.h3}px; --fs-h4:${fs.h4}px;
  --fs-body:${fs.body}px; --fs-small:${fs.small}px;
  --sp-section:${sp.section}px; --sp-container:${sp.container}px; --sp-stack:${sp.stack}px; --sp-gap:${sp.gap}px;
  --rd-sm:${rd.sm}px; --rd-md:${rd.md}px; --rd-lg:${rd.lg}px; --rd-pill:${rd.pill}px;
  --sh-sm:${sh.sm}; --sh-md:${sh.md}; --sh-lg:${sh.lg};
  --dur:${dur}ms;
}
${doc.theme?.toggle ? `html[data-theme="dark"]{
  --bg:${shade(c.background, -0.88)}; --surface:${shade(c.background, -0.82)}; --text:${shade(c.background, 0.9)};
  --muted:${shade(c.background, 0.55)}; --border:${shade(c.background, 0.28)};
  --primary:${c.accent}; --primary-c:${c.accentContrast}; --accent:${c.accent}; --accent-c:${c.accentContrast};
}` : ""}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font-body);font-size:var(--fs-body);line-height:1.65;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
img{max-width:100%;display:block}
a{color:inherit}
h1,h2,h3,h4,p{margin:0}
h1,h2,h3,h4{font-family:var(--font-head);line-height:1.12;letter-spacing:-.01em;font-weight:700;text-wrap:balance}
.bk-container{max-width:var(--sp-container);margin:0 auto;padding-left:24px;padding-right:24px}
.bk-section{padding:calc(var(--sp-section)*.7) 0;position:relative}
.bk-section-alt{background:var(--surface)}
.bk-center{text-align:center;margin-inline:auto}
.bk-eyebrow{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:14px}
.bk-display{font-size:clamp(34px,5.2vw,var(--fs-display))}
.bk-h1{font-size:clamp(30px,4vw,var(--fs-h1))}
.bk-h2{font-size:clamp(24px,3vw,var(--fs-h2))}
.bk-h3{font-size:clamp(19px,2.2vw,var(--fs-h3))}
.bk-h4{font-size:var(--fs-h4)}
.bk-lede{font-size:clamp(16px,1.6vw,18px);color:var(--muted);max-width:640px}
.bk-center .bk-lede{margin-inline:auto}
.bk-muted{color:var(--muted)}
.bk-small{font-size:var(--fs-small)}
.bk-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 26px;border-radius:var(--rd-pill);font-family:var(--font-body);font-size:15px;font-weight:600;text-decoration:none;border:1px solid transparent;cursor:pointer;transition:transform .12s var(--dur),box-shadow var(--dur),filter var(--dur),background var(--dur);white-space:nowrap}
.bk-btn:hover{transform:translateY(-1px)}
.bk-btn-primary{background:var(--primary);color:var(--primary-c);box-shadow:var(--sh-sm)}
.bk-btn-primary:hover{filter:brightness(1.08);box-shadow:var(--sh-md)}
.bk-btn-accent{background:var(--accent);color:var(--accent-c);box-shadow:var(--sh-sm)}
.bk-btn-accent:hover{filter:brightness(1.08);box-shadow:var(--sh-md)}
.bk-btn-ghost{background:transparent;border-color:var(--border);color:var(--text)}
.bk-btn-ghost:hover{border-color:var(--muted);background:var(--surface)}
.bk-btn-row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.bk-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--rd-md);padding:28px}
.bk-grid{display:grid;gap:var(--sp-gap)}
.bk-grid-features{grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}
.bk-grid-3{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.bk-grid-stats{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}

.bk-nav{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--bg) 82%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid color-mix(in srgb,var(--border) 65%,transparent)}
.bk-nav-inner{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 24px;max-width:var(--sp-container);margin:0 auto}
.bk-nav-brand{font-family:var(--font-head);font-weight:800;font-size:19px;letter-spacing:-.02em;text-decoration:none}
.bk-nav-links{display:flex;align-items:center;gap:26px;flex-wrap:wrap}
.bk-nav-links a{text-decoration:none;color:var(--muted);font-size:15px;font-weight:500;transition:color var(--dur)}
.bk-nav-links a:hover{color:var(--text)}
.bk-nav-cta{margin-left:4px}

.bk-hero{position:relative;overflow:hidden;padding-top:calc(var(--sp-section)*1.1)}
.bk-hero-centered{text-align:center}
.bk-hero-inner{display:flex;flex-direction:column;gap:calc(var(--sp-stack)*1.5);align-items:center;justify-content:center;min-height:64vh;padding:32px 0}
.bk-hero-centered .bk-hero-inner{max-width:840px;margin:0 auto}
.bk-hero-split .bk-hero-inner{flex-direction:row;justify-content:space-between;gap:48px;align-items:center}
.bk-hero-split .bk-hero-copy{flex:1.05;max-width:600px}
.bk-hero-split .bk-hero-art{flex:.95}
.bk-hero-title{font-size:clamp(34px,5.6vw,var(--fs-display));line-height:1.05}
.bk-hero-sub{font-size:clamp(16px,1.7vw,18.5px);color:var(--muted);max-width:560px}
.bk-hero-centered .bk-hero-sub{margin-inline:auto}
.bk-hero-trust{margin-top:calc(var(--sp-stack)*.8);font-size:var(--fs-small);color:var(--muted);letter-spacing:.02em}
.bk-hero-glow{position:absolute;inset:0;pointer-events:none;z-index:-1;
  background:
    radial-gradient(42% 38% at 12% 8%, color-mix(in srgb,var(--accent) 14%,transparent), transparent 70%),
    radial-gradient(38% 34% at 88% 20%, color-mix(in srgb,var(--primary) 12%,transparent), transparent 70%),
    radial-gradient(50% 44% at 50% 110%, color-mix(in srgb,var(--accent) 9%,transparent), transparent 70%)}
.bk-hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}
.bk-hero-bg-scrim{position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.55))}
.bk-hero-centered .bk-hero-bg-scrim,.bk-hero-split .bk-hero-bg-scrim{z-index:-1}
.bk-art{position:relative;border-radius:var(--rd-lg);overflow:hidden;aspect-ratio:4/3;background:var(--surface);border:1px solid var(--border);
  background-image:
    linear-gradient(150deg, color-mix(in srgb,var(--primary) 7%,transparent), transparent 45%),
    radial-gradient(60% 55% at 78% 22%, color-mix(in srgb,var(--accent) 22%,transparent), transparent 75%),
    radial-gradient(50% 46% at 18% 78%, color-mix(in srgb,var(--primary) 16%,transparent), transparent 72%);
  background-size:cover;box-shadow:var(--sh-md)}
.bk-art::before{content:"";position:absolute;inset:14%;border:1px solid color-mix(in srgb,var(--text) 10%,transparent);border-radius:var(--rd-md);transform:rotate(2.5deg)}
.bk-art::after{content:"";position:absolute;inset:22% 30%;border-radius:var(--rd-md);background:color-mix(in srgb,var(--surface) 55%,transparent);box-shadow:var(--sh-sm);backdrop-filter:blur(2px)}
.bk-art-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.bk-gallery-item{overflow:hidden;border-radius:var(--rd-md);border:1px solid var(--border)}
.bk-gallery-art{aspect-ratio:4/3;background-image:linear-gradient(145deg,color-mix(in srgb,var(--primary) 10%,transparent),transparent 50%),radial-gradient(70% 65% at 75% 20%,color-mix(in srgb,var(--accent) 26%,transparent),transparent 75%);background-size:cover;display:flex;align-items:flex-end;padding:14px}
.bk-gallery-img{width:100%;height:100%;object-fit:cover;aspect-ratio:4/3}
.bk-gallery-caption{padding:12px 16px 14px;background:var(--surface);font-size:var(--fs-small);color:var(--muted)}
.bk-gallery-art .bk-gallery-caption{background:transparent;color:var(--primary-c)}

.bk-section-head{max-width:680px;margin:0 auto calc(var(--sp-section)*.55);text-align:center}
.bk-section-head h2{font-size:clamp(24px,3vw,var(--fs-h2))}
.bk-section-head p{margin-top:14px}

.bk-logo-row{display:flex;flex-wrap:wrap;gap:14px 44px;justify-content:center;align-items:center}
.bk-logo{font-family:var(--font-head);font-size:19px;font-weight:700;letter-spacing:.02em;color:var(--muted);opacity:.72}

.bk-feature{background:var(--surface);border:1px solid var(--border);border-radius:var(--rd-md);padding:30px;transition:transform var(--dur),box-shadow var(--dur);position:relative;overflow:hidden}
.bk-feature:hover{transform:translateY(-3px);box-shadow:var(--sh-md)}
.bk-feature-icon{width:48px;height:48px;border-radius:var(--rd-sm);display:flex;align-items:center;justify-content:center;color:var(--accent);background:color-mix(in srgb,var(--accent) 11%,transparent);margin-bottom:18px}
.bk-feature h3{margin-bottom:8px}
.bk-feature p{color:var(--muted);font-size:15px}

.bk-stat{text-align:center;padding:8px}
.bk-stat-value{font-family:var(--font-head);font-weight:800;font-size:clamp(30px,3.4vw,44px);letter-spacing:-.02em;color:var(--text);line-height:1}
.bk-stat-value .bk-stat-accent{color:var(--accent)}
.bk-stat-label{margin-top:10px;font-size:var(--fs-small);color:var(--muted);letter-spacing:.03em}

.bk-quote-card{display:flex;flex-direction:column;gap:16px}
.bk-quote-mark{font-family:var(--font-head);font-size:44px;line-height:.6;color:var(--accent);font-weight:800}
.bk-quote{font-size:15.5px;line-height:1.6}
.bk-quote-who{margin-top:auto;padding-top:14px;border-top:1px solid var(--border)}
.bk-quote-name{font-weight:700;font-size:15px}
.bk-quote-role{font-size:var(--fs-small);color:var(--muted)}

.bk-price{border:1px solid var(--border);border-radius:var(--rd-md);padding:32px;display:flex;flex-direction:column;gap:18px;background:var(--surface)}
.bk-price-featured{background:var(--primary);color:var(--primary-c);border-color:transparent;box-shadow:var(--sh-lg);transform:scale(1.03)}
.bk-price-name{font-family:var(--font-head);font-weight:700;font-size:var(--fs-h4)}
.bk-price-amount{display:flex;align-items:baseline;gap:6px}
.bk-price-num{font-family:var(--font-head);font-weight:800;font-size:clamp(34px,3vw,44px);letter-spacing:-.02em}
.bk-price-desc{font-size:14.5px;opacity:.85}
.bk-price-feat{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;font-size:15px}
.bk-price-feat li{display:flex;gap:10px;align-items:flex-start}
.bk-price-feat svg{flex:none;margin-top:2px;color:var(--accent)}
.bk-price-featured .bk-price-feat svg{color:var(--accent)}
.bk-price .bk-btn{margin-top:auto}

.bk-faq{max-width:760px;margin:0 auto}
.bk-faq-item{border-bottom:1px solid var(--border)}
.bk-faq-item:first-child{border-top:1px solid var(--border)}
.bk-faq-item summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px 4px;font-family:var(--font-head);font-weight:600;font-size:var(--fs-h4)}
.bk-faq-item summary::-webkit-details-marker{display:none}
.bk-faq-mark{flex:none;width:22px;height:22px;border-radius:50%;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--accent);transition:transform var(--dur),background var(--dur),color var(--dur);font-size:13px;line-height:1}
.bk-faq-item[open] .bk-faq-mark{transform:rotate(45deg);background:var(--accent);border-color:var(--accent);color:var(--accent-c)}
.bk-faq-body{padding:0 4px 24px;color:var(--muted);max-width:640px}

.bk-cta{position:relative;overflow:hidden;border-radius:var(--rd-lg);background:var(--primary);color:var(--primary-c);text-align:center;padding:clamp(48px,7vw,84px) 32px}
.bk-cta::before{content:"";position:absolute;inset:0;background:radial-gradient(55% 60% at 50% 0%,color-mix(in srgb,var(--accent) 26%,transparent),transparent 75%)}
.bk-cta-inner{position:relative;max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:18px;align-items:center}
.bk-cta h2{font-size:clamp(26px,3.6vw,var(--fs-h1))}
.bk-cta p{opacity:.82;font-size:17px;max-width:520px}
.bk-cta-note{margin-top:6px;font-size:var(--fs-small);opacity:.6}

.bk-contact-grid{display:grid;grid-template-columns:1fr 1.2fr;gap:calc(var(--sp-gap)*1.6);align-items:start}
.bk-contact-info{display:flex;flex-direction:column;gap:22px}
.bk-contact-line{display:flex;gap:14px;align-items:flex-start}
.bk-contact-icon{flex:none;width:40px;height:40px;border-radius:var(--rd-sm);background:color-mix(in srgb,var(--accent) 11%,transparent);color:var(--accent);display:flex;align-items:center;justify-content:center}
.bk-contact-line b{display:block;font-size:14px;margin-bottom:2px}
.bk-contact-line span,.bk-contact-line a{color:var(--muted);font-size:15px;text-decoration:none}
.bk-contact-line a:hover{color:var(--text)}
.bk-form{display:flex;flex-direction:column;gap:16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--rd-md);padding:32px}
.bk-field{display:flex;flex-direction:column;gap:7px}
.bk-field label{font-size:14px;font-weight:600}
.bk-field input,.bk-field textarea{font-family:var(--font-body);font-size:15px;padding:12px 14px;border:1px solid var(--border);border-radius:var(--rd-sm);background:var(--bg);color:var(--text);transition:border-color var(--dur),box-shadow var(--dur)}
.bk-field input:focus,.bk-field textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}
.bk-form-success{color:var(--accent);font-weight:600;font-size:15px;min-height:20px}

.bk-footer{border-top:1px solid var(--border);background:var(--surface)}
.bk-footer-inner{display:grid;grid-template-columns:1.4fr repeat(2,1fr);gap:calc(var(--sp-gap)*1.4);padding:calc(var(--sp-section)*.6) 0 32px}
.bk-footer h4{font-size:13px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px;color:var(--text)}
.bk-footer-col ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}
.bk-footer-col a{color:var(--muted);text-decoration:none;font-size:15px;transition:color var(--dur)}
.bk-footer-col a:hover{color:var(--text)}
.bk-footer-note{color:var(--muted);font-size:15px;max-width:320px;margin-bottom:18px}
.bk-socials{display:flex;gap:10px}
.bk-social{width:38px;height:38px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--muted);transition:color var(--dur),border-color var(--dur),background var(--dur)}
.bk-social:hover{color:var(--accent);border-color:var(--accent);background:color-mix(in srgb,var(--accent) 8%,transparent)}
.bk-footer-bottom{border-top:1px solid var(--border);padding:20px 0;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:var(--fs-small);color:var(--muted)}

@media (max-width:860px){
  .bk-hero-split .bk-hero-inner{flex-direction:column;gap:28px}
  .bk-hero-inner{min-height:0}
  .bk-contact-grid{grid-template-columns:1fr}
  .bk-footer-inner{grid-template-columns:1fr}
  .bk-nav-inner{flex-wrap:wrap}
  .bk-price-featured{transform:none}
}
@media (max-width:520px){
  .bk-section{padding:calc(var(--sp-section)*.55) 0}
  .bk-btn{width:100%}
  .bk-btn-row .bk-btn{margin-right:0}
}
.bk-editing [data-sec]{cursor:pointer}
.bk-editing [data-sec]:hover{outline:1px solid color-mix(in srgb,var(--accent) 60%,transparent);outline-offset:-1px}
.bk-editing [data-sec].bk-sel{outline:2px solid var(--accent);outline-offset:-2px}

.bk-team-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--rd-md);padding:26px;display:flex;flex-direction:column;gap:8px;text-align:center;align-items:center;transition:transform var(--dur),box-shadow var(--dur)}
.bk-team-card:hover{transform:translateY(-3px);box-shadow:var(--sh-md)}
.bk-team-avatar{width:76px;height:76px;border-radius:50%;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-head);font-size:30px;font-weight:800;margin-bottom:8px}
.bk-team-photo{width:76px;height:76px;border-radius:50%;overflow:hidden;margin-bottom:8px}
.bk-team-photo img{width:100%;height:100%;object-fit:cover}
.bk-team-role{font-size:13px;font-weight:600;color:var(--accent);letter-spacing:.04em;text-transform:uppercase}
.bk-team-bio{font-size:14px;color:var(--muted)}

.bk-timeline{list-style:none;padding:0;margin:0;max-width:760px;margin-inline:auto;position:relative}
.bk-timeline::before{content:"";position:absolute;left:8px;top:6px;bottom:6px;width:2px;background:linear-gradient(var(--accent),color-mix(in srgb,var(--accent) 25%,transparent))}
.bk-timeline-item{display:flex;gap:26px;padding:14px 0 22px;position:relative}
.bk-timeline-dot{flex:none;width:18px;height:18px;border-radius:50%;background:var(--bg);border:3px solid var(--accent);margin-top:5px;box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 14%,transparent)}
.bk-timeline-body p{color:var(--muted);font-size:15px;margin-top:6px}
.bk-timeline-period{font-family:var(--font-head);font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:4px}

.bk-cmp-wrap{overflow-x:auto}
.bk-cmp{width:100%;border-collapse:collapse;background:var(--surface);border:1px solid var(--border);border-radius:var(--rd-md);overflow:hidden;font-size:15px}
.bk-cmp th,.bk-cmp td{padding:15px 18px;text-align:left;border-bottom:1px solid var(--border);vertical-align:middle}
.bk-cmp thead-style-none,.bk-cmp tr:last-child th,.bk-cmp tr:last-child td{border-bottom:none}
.bk-cmp th{font-family:var(--font-head);font-weight:700}
.bk-cmp .bk-cmp-corner{color:var(--muted);font-size:14px;font-weight:600}
.bk-cmp tr:first-child th{background:var(--surface)}
.bk-cmp-stripe th,.bk-cmp-stripe td{background:color-mix(in srgb,var(--accent) 3.5%,transparent)}
.bk-cmp .bk-cmp-no{color:var(--muted);opacity:.55}
.bk-cmp .bk-cmp-yes{color:var(--accent);display:inline-flex}

.bk-newsletter{background:var(--primary);color:var(--primary-c);border-radius:var(--rd-lg);padding:clamp(40px,6vw,72px) 32px;position:relative;overflow:hidden}
.bk-newsletter::before{content:"";position:absolute;inset:0;background:radial-gradient(60% 70% at 85% 10%,color-mix(in srgb,var(--accent) 22%,transparent),transparent 75%)}
.bk-newsletter-inner{position:relative;max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:14px;align-items:flex-start}
.bk-newsletter-inner .bk-lede{color:inherit;opacity:.85;margin:0}
.bk-newsletter-form{width:100%;display:flex;flex-direction:column;gap:10px}
.bk-newsletter-row{display:flex;gap:10px;flex-wrap:wrap}
.bk-newsletter-row input{flex:1;min-width:220px;padding:13px 16px;border:none;border-radius:var(--rd-pill);font-family:var(--font-body);font-size:15px;background:var(--primary-c);color:var(--primary)}
.bk-newsletter-row input:focus{outline:3px solid color-mix(in srgb,var(--accent) 45%,transparent)}
.bk-newsletter-note{font-size:var(--fs-small);opacity:.65}

.bk-video{position:relative;aspect-ratio:16/9;border-radius:var(--rd-lg);overflow:hidden;background:var(--surface);border:1px solid var(--border);box-shadow:var(--sh-md)}
.bk-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.bk-video-empty{display:flex;align-items:center;justify-content:center;color:var(--muted)}
.bk-video-caption{margin-top:12px;text-align:center;color:var(--muted);font-size:var(--fs-small)}
.bk-embed{position:relative;aspect-ratio:16/9;border-radius:var(--rd-lg);overflow:hidden;background:var(--surface);border:1px solid var(--border);box-shadow:var(--sh-md)}
.bk-embed iframe{position:absolute;inset:0;width:100%;height:100%}
.bk-embed-caption{margin-top:12px;text-align:center;color:var(--muted);font-size:var(--fs-small)}
.bk-map-grid{display:grid;grid-template-columns:2fr 1fr;gap:var(--sp-gap);align-items:stretch}
.bk-map-frame{width:100%;height:100%;min-height:360px;border:1px solid var(--border);border-radius:var(--rd-md);background:var(--surface)}
.bk-map-placeholder{border:1px solid var(--border);border-radius:var(--rd-md);background:var(--surface);display:flex;align-items:center;justify-content:center;color:var(--muted);min-height:360px;
  background-image:linear-gradient(145deg,color-mix(in srgb,var(--primary) 8%,transparent),transparent 50%),radial-gradient(70% 70% at 70% 25%,color-mix(in srgb,var(--accent) 20%,transparent),transparent 75%)}
.bk-map-info{display:flex;flex-direction:column;gap:16px;justify-content:center;background:var(--surface);border:1px solid var(--border);border-radius:var(--rd-md);padding:26px}
@media (max-width:860px){.bk-map-grid{grid-template-columns:1fr}}

/* custom */
.bk-custom{max-width:var(--sp-container);margin:0 auto;padding:0 24px}

/* products */
.bk-product{display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:var(--rd-lg);overflow:hidden;transition:transform .2s,box-shadow .2s}
.bk-product:hover{transform:translateY(-3px);box-shadow:var(--sh-md)}
.bk-product-image{aspect-ratio:4/3;overflow:hidden;background:var(--bg)}
.bk-product-image img{width:100%;height:100%;object-fit:cover}
.bk-product-image-placeholder{aspect-ratio:4/3;background:linear-gradient(145deg,color-mix(in srgb,var(--primary) 12%,transparent),transparent 60%),radial-gradient(60% 60% at 70% 30%,color-mix(in srgb,var(--accent) 22%,transparent),transparent 75%)}
.bk-product-badge{position:absolute;top:14px;left:14px;background:var(--accent);color:var(--accentContrast);font-size:var(--fs-small);font-weight:700;padding:4px 12px;border-radius:var(--rd-pill);z-index:2}
.bk-product{position:relative}
.bk-product-content{display:flex;flex-direction:column;gap:8px;padding:22px;flex:1}
.bk-product-price{font-family:var(--font-head);font-size:22px;font-weight:700}
.bk-product-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;padding-top:14px}

/* booking */
.bk-booking-embed{aspect-ratio:16/10;border:1px solid var(--border);border-radius:var(--rd-lg);overflow:hidden;background:var(--surface)}
.bk-booking-embed iframe{width:100%;height:100%;border:0}
.bk-form{display:flex;flex-direction:column;gap:16px;max-width:560px}
.bk-form .bk-field{display:flex;flex-direction:column;gap:6px}
.bk-form input,.bk-form textarea{width:100%;padding:11px 14px;border:1px solid var(--border);border-radius:var(--rd-md);background:var(--bg);color:var(--text);font-size:var(--fs-body);font-family:inherit}
.bk-form input:focus,.bk-form textarea:focus{outline:none;border-color:var(--primary)}
.bk-form-success{min-height:1.4em;font-size:var(--fs-small);color:var(--accent)}

/* posts */
.bk-posts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--sp-gap)}
.bk-posts-list{display:flex;flex-direction:column;gap:var(--sp-gap)}
.bk-post-card{display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:var(--rd-lg);overflow:hidden;transition:transform .2s,box-shadow .2s}
.bk-post-card:hover{transform:translateY(-3px);box-shadow:var(--sh-md)}
.bk-posts-list .bk-post-card{flex-direction:row}
@media (max-width:640px){.bk-posts-list .bk-post-card{flex-direction:column}}
.bk-post-cover{aspect-ratio:16/9;overflow:hidden}
.bk-post-cover img{width:100%;height:100%;object-fit:cover}
.bk-post-cover-placeholder{aspect-ratio:16/9;background:linear-gradient(145deg,color-mix(in srgb,var(--primary) 14%,transparent),transparent 60%)}
.bk-post-content{display:flex;flex-direction:column;gap:6px;padding:20px}
.bk-posts-list .bk-post-cover,.bk-posts-list .bk-post-cover-placeholder{aspect-ratio:auto;width:38%;min-height:200px}
@media (max-width:640px){.bk-posts-list .bk-post-cover,.bk-posts-list .bk-post-cover-placeholder{width:100%;aspect-ratio:16/9}}
.bk-post-category{font-size:var(--fs-small);font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.08em}
.bk-post-date{font-size:var(--fs-small);color:var(--muted)}
.bk-post-card a{color:inherit;text-decoration:none}
.bk-post-card a:hover{color:var(--accent)}

/* post modal */
.bk-post-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;background:rgba(10,12,16,.6);backdrop-filter:blur(3px);overflow-y:auto}
.bk-modal-overlay{position:relative;background:var(--bg);color:var(--text);border-radius:var(--rd-lg);max-width:760px;width:100%;box-shadow:var(--sh-lg);padding:28px}
.bk-post-modal-close{position:absolute;top:14px;right:14px;background:none;border:none;color:var(--muted);font-size:22px;cursor:pointer;line-height:1}
.bk-post-hero{width:100%;max-height:380px;object-fit:cover;border-radius:var(--rd-md);margin-bottom:16px}
.bk-post-body{line-height:1.7;margin-top:14px}

/* nav extras */
.bk-announcement{background:var(--accent);color:var(--accent-c);text-align:center;font-size:var(--fs-small);padding:8px 16px;font-weight:600}
.bk-announcement a{color:inherit;text-decoration:underline}
.bk-nav-sticky{position:sticky;top:0;z-index:1000;background:var(--bg);transition:box-shadow .2s,background .2s}
.bk-nav-sticky.bk-nav-scrolled{box-shadow:var(--sh-md)}
.bk-nav-extra{display:flex;align-items:center;gap:10px}
.bk-lang-switch{background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:var(--rd-md);padding:6px 10px;font-size:var(--fs-small);cursor:pointer}
.bk-search-toggle{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:var(--rd-md);border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer}
.bk-theme-toggle{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:var(--rd-md);border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer}
.bk-search-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9995;display:none;align-items:flex-start;justify-content:center;padding:12vh 16px 16px}
.bk-search-box{width:min(560px,100%);background:var(--bg);border:1px solid var(--border);border-radius:var(--rd-lg);box-shadow:var(--sh-lg);overflow:hidden}
.bk-search-box input{width:100%;padding:16px 18px;font-size:16px;background:transparent;border:none;color:var(--text);outline:none}
.bk-search-results{list-style:none;margin:0;padding:0;border-top:1px solid var(--border);max-height:52vh;overflow-y:auto}
.bk-search-hit{padding:0}
.bk-search-hit a,.bk-search-hit span{display:block;padding:11px 18px;color:var(--text);font-size:14px;text-decoration:none}
.bk-search-hit a:hover{background:var(--surface)}
.bk-search-empty{padding:14px 18px;color:var(--muted);font-size:13px}
.bk-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;display:none;align-items:center;justify-content:space-between;gap:16px;background:var(--bg);border:1px solid var(--border);border-radius:var(--rd-lg);box-shadow:var(--sh-lg);padding:14px 18px;max-width:720px;margin:0 auto}
.bk-cookie-text{font-size:13px;color:var(--text);line-height:1.5}
.bk-cookie-text a{color:var(--accent)}
.bk-cookie-actions{display:flex;gap:8px;flex-shrink:0}
@media (max-width:640px){.bk-cookie{flex-direction:column;align-items:stretch;text-align:center}.bk-cookie-actions{justify-content:center}}
.bk-cart-toggle{position:relative;display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:var(--rd-md);border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer}
.bk-cart-count{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;border-radius:var(--rd-pill);background:var(--accent);color:var(--accentContrast);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px}
.bk-cart-drawer{position:fixed;top:0;right:0;bottom:0;width:min(380px,100vw);background:var(--bg);border-left:1px solid var(--border);box-shadow:var(--sh-lg);z-index:9998;transform:translateX(100%);transition:transform .25s}
.bk-cart-drawer.bk-open{transform:translateX(0)}
.bk-cart-drawer-inner{display:flex;flex-direction:column;height:100%}
.bk-cart-drawer-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)}
.bk-cart-drawer-head button{background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer}
.bk-cart-items{flex:1;overflow-y:auto;padding:16px 20px}
.bk-cart-item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}
.bk-cart-item-main{min-width:0}
.bk-cart-item-name{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bk-cart-item-sub{color:var(--muted);font-size:13px;margin-top:2px}
.bk-cart-remove{background:none;border:none;color:var(--muted);font-size:16px;cursor:pointer;padding:4px}
.bk-cart-remove:hover{color:var(--text)}
.bk-cart-total{display:flex;justify-content:space-between;align-items:center;padding:14px 0;font-weight:700}
.bk-cart-note{color:var(--muted);font-size:12px;margin-top:8px}
#bk-cart-checkout{width:100%;text-align:center;display:block}

/* motion */
.bk-motion-fade,.bk-motion-slide-up,.bk-motion-slide-left,.bk-motion-slide-right,.bk-motion-zoom,.bk-motion-marquee{opacity:0}
.bk-motion-fade.bk-in-view,.bk-motion-slide-up.bk-in-view,.bk-motion-slide-left.bk-in-view,.bk-motion-slide-right.bk-in-view,.bk-motion-zoom.bk-in-view,.bk-motion-marquee.bk-in-view{opacity:1}
.bk-motion-fade{transition:opacity .7s ease}
.bk-motion-fade.bk-in-view{animation:bk-fade .7s ease both}
.bk-motion-slide-up.bk-in-view{animation:bk-up .7s ease both}
.bk-motion-slide-left.bk-in-view{animation:bk-left .7s ease both}
.bk-motion-slide-right.bk-in-view{animation:bk-right .7s ease both}
.bk-motion-zoom.bk-in-view{animation:bk-zoom .7s ease both}
.bk-motion-marquee{opacity:1}
@keyframes bk-fade{from{opacity:0}to{opacity:1}}
@keyframes bk-up{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
@keyframes bk-left{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:none}}
@keyframes bk-right{from{opacity:0;transform:translateX(-26px)}to{opacity:1;transform:none}}
@keyframes bk-zoom{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
.bk-motion-parallax{will-change:transform}
.bk-to-top{position:fixed;right:20px;bottom:20px;z-index:9000;width:44px;height:44px;border-radius:var(--rd-pill);border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:18px;cursor:pointer;opacity:0;pointer-events:none;transform:translateY(8px);transition:opacity .25s,transform .25s}
.bk-to-top.bk-to-top-show{opacity:1;pointer-events:auto;transform:none}
.bk-popup{position:fixed;inset:0;z-index:9996;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55);padding:20px}
.bk-popup-card{position:relative;width:min(440px,100%);background:var(--bg);border:1px solid var(--border);border-radius:var(--rd-lg);box-shadow:var(--sh-lg);padding:30px;text-align:center}
.bk-popup-card h3{margin:0 0 8px}
.bk-popup-card p{color:var(--muted);margin:0 0 18px;font-size:15px}
.bk-popup-close{position:absolute;top:10px;right:14px;background:none;border:none;color:var(--muted);font-size:22px;cursor:pointer;line-height:1}
.bk-popup-close:hover{color:var(--text)}
`;

}
