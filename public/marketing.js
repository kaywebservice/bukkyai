// Shared Wix-style nav + footer for all marketing pages.
(function () {
  var page = (location.pathname.split("/").pop() || "landing.html").replace(".html", "");
  if (page === "") page = "landing";

  var isActive = function (p) { return page === p ? " active" : ""; };

  var mega = '' +
    '<div class="mega">' +
      '<div class="mega-group"><h4>Build</h4>' +
        '<a href="/features">Website builder<small>Describe it, get a full site</small></a>' +
        '<a href="/templates">Templates<small>6 ready-made multi-page sites</small></a>' +
'<a href="/playground">Live demos<small>Preview and remix, no signup</small></a>' +
        '<a href="/features#blog">Blog & SEO<small>Posts, sitemap, RSS, JSON-LD</small></a>' +
        '<a href="/industries">Industries<small>Builders for every type of business</small></a>' +
      '</div>' +
      '<div class="mega-group"><h4>Business</h4>' +
        '<a href="/pricing">Pricing<small>Free to build, Pro to publish</small></a>' +
        '<a href="/features#shop">Shop & payments<small>Cart, checkout, coupons</small></a>' +
        '<a href="/features#forms">Forms & analytics<small>Captures, stats, dashboards</small></a>' +
      '</div>' +
      '<div class="mega-group"><h4>Resources</h4>' +
        '<a href="/blog">Blog<small>Guides on building your site</small></a>' +
        '<a href="/faq">FAQ<small>Questions, answered</small></a>' +
        '<a href="/contact">Contact<small>Talk to a human</small></a>' +
        '<a href="/app">The editor<small>Open bukkyai and build</small></a>' +
      '</div>' +
    '</div>';

  var navHtml = '' +
    '<div class="nav-inner">' +
      '<a class="brand" href="/"><span class="brand-mark">b</span>bukkyai</a>' +
      '<div class="nav-links">' +
        '<div class="mega-trigger"><button class="nav-link">Product <span class="mega-caret">▼</span></button>' + mega + '</div>' +
        '<a class="nav-link' + isActive("features") + '" href="/features">Features</a>' +
        '<a class="nav-link' + isActive("tools") + '" href="/tools">Tools</a>' +
        '<a class="nav-link' + isActive("templates") + '" href="/templates">Templates</a>' +
        '<a class="nav-link' + isActive("made-with") + '" href="/made-with">Made with</a>' +
        '<a class="nav-link' + isActive("playground") + '" href="/playground">Try it</a>' +
        '<a class="nav-link' + isActive("pricing") + '" href="/pricing">Pricing</a>' +
        '<a class="nav-link' + isActive("blog") + '" href="/blog">Blog</a>' +
        '<a class="nav-link' + isActive("faq") + '" href="/faq">FAQ</a>' +
      '</div>' +
      '<div class="nav-cta">' +
        '<a class="btn btn-primary" href="/app">Get started</a>' +
      '</div>' +
      '<button class="nav-burger" aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>' +
    '</div>' +
    '<div class="mobile-menu">' +
      '<span class="m-group-title">Product</span>' +
      '<a href="/features">Website builder</a>' +
      '<a href="/tools">Free tools</a>' +
      '<a href="/templates">Templates</a>' +
      '<a href="/made-with">Made with bukkyai</a>' +
      '<a href="/playground">Live demos</a>' +
      '<a href="/pricing">Pricing</a>' +
      '<span class="m-group-title">Resources</span>' +
      '<a href="/faq">FAQ</a>' +
      '<a href="/blog">Blog</a>' +
      '<a href="/contact">Contact</a>' +
      '<a class="btn btn-primary" href="/app">Get started</a>' +
    '</div>';

  var footHtml = '' +
    '<div class="wrap">' +
      '<div class="foot">' +
        '<div class="brand-col">' +
          '<a class="brand" href="/"><span class="brand-mark">b</span>bukkyai</a>' +
          '<p class="brand-desc">Describe your business. bukkyai plans, designs and writes your entire website — then you own it forever.</p>' +
        '</div>' +
        '<div><h4>Product</h4><a href="/features">Features</a><a href="/templates">Templates</a><a href="/pricing">Pricing</a><a href="/app">Open editor</a></div>' +
        '<div><h4>Resources</h4><a href="/faq">FAQ</a><a href="/blog">Blog</a><a href="/contact">Contact</a><a href="/badge">Made-with badge</a></div>' +
        '<div><h4>Company</h4><span style="font-size:13px;color:var(--faint)">Designed by Kaywebservice Enterprise Solutions</span></div>' +
      '</div>' +
      '<div class="foot-bottom">' +
        '<span>© <span id="year"></span> bukkyai</span>' +
        '<span>Designed by Kaywebservice Enterprise Solutions</span>' +
      '</div>' +
    '</div>';

  // Insert the nav at the top of <body> and the footer at the bottom,
  // regardless of where this script tag sits.
  var nav = document.createElement("nav");
  nav.className = "nav";
  nav.id = "bk-nav";
  nav.innerHTML = navHtml;
  document.body.insertBefore(nav, document.body.firstChild);

  var footer = document.createElement("footer");
  footer.innerHTML = footHtml;
  document.body.appendChild(footer);

  document.getElementById("year").textContent = new Date().getFullYear();

  // ── SEO: canonical + Organization / SoftwareApplication / FAQ JSON-LD ──
  var canonical = document.createElement("link");
  canonical.rel = "canonical";
  canonical.href = "https://bukkyai.duckdns.org" + (location.pathname === "/" ? "/" : location.pathname);
  document.head.appendChild(canonical);

  // Bing & Yandex webmaster verification — paste your codes below from
  // bing.com/webmasters and webmaster.yandex.ru, then rebuild.
  var BING_CODE = "";  // e.g. "ABCDEF0123456789ABCDEF0123456789"
  var YANDEX_CODE = ""; // e.g. "abcdef0123456789"
  if (BING_CODE) {
    var bingMeta = document.createElement("meta");
    bingMeta.name = "msvalidate.01";
    bingMeta.content = BING_CODE;
    document.head.appendChild(bingMeta);
  }
  if (YANDEX_CODE) {
    var yandexMeta = document.createElement("meta");
    yandexMeta.name = "yandex-verification";
    yandexMeta.content = YANDEX_CODE;
    document.head.appendChild(yandexMeta);
  }
  if (BING_CODE || YANDEX_CODE) {
    var idx = document.createElement("meta");
    idx.name = "indexnow";
    idx.content = "https://bukkyai.duckdns.org/indexnow-key.txt";
    document.head.appendChild(idx);
  }

  var schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://bukkyai.duckdns.org/#org",
        "name": "bukkyai",
        "url": "https://bukkyai.duckdns.org/",
        "description": "AI website builder that plans, designs and writes your entire website from a short description.",
        "sameAs": []
      },
      {
        "@type": "SoftwareApplication",
        "name": "bukkyai",
        "applicationCategory": "WebApplication",
        "operatingSystem": "Web",
        "url": "https://bukkyai.duckdns.org/app",
        "offers": { "@type": "AggregateOffer", "lowPrice": "0", "highPrice": "35", "priceCurrency": "USD" },
        "publisher": { "@id": "https://bukkyai.duckdns.org/#org" }
      }
    ]
  };
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq-item")).map(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    return { "@type": "Question", name: q ? q.textContent.replace("▾", "").trim() : "", acceptedAnswer: { "@type": "Answer", text: a ? a.textContent.trim() : "" } };
  }).filter(function (x) { return x.name; });
  if (faqItems.length) schema["@graph"].push({ "@type": "FAQPage", mainEntity: faqItems });

  // BreadcrumbList for every page with a path (e.g. /blog/how-to-write-a-website-brief)
  var crumbs = [];
  var segs = location.pathname.split("/").filter(Boolean);
  var acc = "";
  if (segs.length) {
    crumbs.push({ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bukkyai.duckdns.org/" });
    segs.forEach(function (seg, i) {
      acc += "/" + seg;
      var label = seg.replace(/[-_]/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      var isLast = i === segs.length - 1;
      var item = isLast ? undefined : { "@id": "https://bukkyai.duckdns.org" + acc };
      crumbs.push({ "@type": "ListItem", "position": i + 2, "name": label, ...(item || {}) });
    });
    schema["@graph"].push({ "@type": "BreadcrumbList", "itemListElement": crumbs });
  }

  // Article schema on blog posts.
  var artH1 = document.querySelector(".art h1");
  if (artH1) {
    var artMeta = document.querySelector(".art .meta");
    schema["@graph"].push({
      "@type": "Article",
      "headline": artH1.textContent.trim(),
      "url": "https://bukkyai.duckdns.org" + location.pathname,
      "description": (document.querySelector('meta[name="description"]') || {}).content || "",
      "author": { "@type": "Organization", "name": "bukkyai", "@id": "https://bukkyai.duckdns.org/#org" },
      "publisher": { "@id": "https://bukkyai.duckdns.org/#org" },
      "mainEntityOfPage": "https://bukkyai.duckdns.org" + location.pathname,
      "category": artMeta ? artMeta.textContent.trim() : "Blog"
    });
  }
  var ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify(schema);
  document.head.appendChild(ld);

  var burger = document.querySelector(".nav-burger");
  var mobileMenu = document.querySelector(".mobile-menu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
  }

  // Exit-intent popup: gentle reminder on marketing pages, once per session.
  (function () {
    var shown = false;
    try { shown = sessionStorage.getItem("bukkyai.exit") === "1"; } catch (e) {}
    if (shown) return;
    if (/^\/app/.test(location.pathname)) return;

    function show() {
      if (shown) return;
      shown = true;
      try { sessionStorage.setItem("bukkyai.exit", "1"); } catch (e) {}
      var el = document.createElement("div");
      el.className = "exit-pop";
      el.innerHTML =
        '<div class="exit-card">' +
          '<button class="exit-x" aria-label="Close">&times;</button>' +
          '<div class="exit-mark">b</div>' +
          '<h3>Still deciding?</h3>' +
          '<p>Describe your business in one sentence — bukkyai plans, writes and designs the whole site. Free to build, you own every file.</p>' +
          '<a class="btn btn-primary" href="/app">Try it — it\'s free</a>' +
          '<a class="exit-live" href="/playground">See live demos first →</a>' +
        '</div>';
      document.body.appendChild(el);
      el.querySelector(".exit-x").addEventListener("click", function () { el.remove(); });
      el.addEventListener("click", function (e) { if (e.target === el) el.remove(); });
    }

    document.addEventListener("mouseout", function (e) {
      if (e.relatedTarget === null && e.clientY < 40) show();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) show();
    });
    setTimeout(show, 30000); // fallback: show once after 30s
  })();
})();
