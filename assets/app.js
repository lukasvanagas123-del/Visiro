// Visiro pitch site: home, interactive plan demo and pitch deck in one page.
// Routes use plain hash tokens: #home, #demo, #demo-pro, #demo-pro-insights, #deck, #deck-6
(() => {
  const C = window.VISIRO;
  const { product, plans, features, pitch } = C;
  const rank = Object.fromEntries(plans.map((p, i) => [p.id, i]));
  const planById = (id) => plans.find((p) => p.id === id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const priceLabel = (p) => (p.price === null ? "Custom" : `$${p.price}`);
  const newIn = (p) => features.filter((f) => f.minPlan === p.id);
  const hasFeature = (planId, f) => rank[planId] >= rank[f.minPlan];
  const isNum = (v) => typeof v === "number";

  // Sample usage per plan so the limit meters look realistic in each preview.
  const SAMPLE_USAGE = {
    free: { seats: 1, dashboards: 3, sources: 2 },
    pro: { seats: 3, dashboards: 9, sources: 6 },
    business: { seats: 18, dashboards: 64, sources: 21 },
    enterprise: { seats: 412, dashboards: 1380, sources: 140 },
  };

  // ── Mock charts ─────────────────────────────────────────────────────────
  function series(n, seed, base, amp) {
    let x = seed;
    const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280;
    return Array.from({ length: n }, (_, i) => base + i * amp * 0.08 + (rnd() - 0.4) * amp);
  }
  function lineChart(data) {
    const w = 600, h = 170, l = 44, r = 10, t = 10, b = 22;
    const min = Math.floor(Math.min(...data) / 1000) * 1000, max = Math.ceil(Math.max(...data) / 1000) * 1000;
    const X = (i) => l + (i / (data.length - 1)) * (w - l - r);
    const Y = (v) => t + (1 - (v - min) / (max - min)) * (h - t - b);
    const d = data.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join("");
    const ticks = [min, (min + max) / 2, max];
    const last = data.length - 1;
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Daily revenue, last 30 days">
      ${ticks.map((v) => `<line class="grid" x1="${l}" x2="${w - r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${l - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="11">$${(v / 1000).toFixed(1)}k</text>`).join("")}
      <text x="${l}" y="${h - 4}" font-size="11">1 Sep</text><text x="${w - r}" y="${h - 4}" font-size="11" text-anchor="end">30 Sep</text>
      <path d="${d}L${X(last)},${h - b}L${l},${h - b}Z" fill="var(--accent)" opacity=".12"/>
      <path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2.5"/>
      <circle cx="${X(last)}" cy="${Y(data[last])}" r="4.5" fill="var(--accent)"/></svg>`;
  }
  function barChart(data, labels) {
    const w = 600, h = 170, b = 22, t = 16, max = Math.max(...data), bw = w / data.length;
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Orders by channel">
      ${data.map((v, i) => {
        const bh = (v / max) * (h - b - t), x = i * bw + bw * 0.22;
        return `<rect x="${x}" y="${h - b - bh}" width="${bw * 0.56}" height="${bh}" rx="4" fill="var(--accent)" opacity="${0.5 + (v / max) * 0.5}"/>
          <text x="${i * bw + bw / 2}" y="${h - b - bh - 4}" text-anchor="middle" font-size="11">${v}</text>
          <text x="${i * bw + bw / 2}" y="${h - 5}" text-anchor="middle" font-size="11">${labels[i]}</text>`;
      }).join("")}</svg>`;
  }

  // ── Feature screens ─────────────────────────────────────────────────────
  const SCREENS = {
    dashboards: (s) => {
      const p = planById(s.plan), full = isNum(p.limits.dashboards) && s.usage.dashboards >= p.limits.dashboards;
      return `<div class="tabs"><button class="btn on" type="button">Revenue overview</button><button class="btn" type="button">Marketing</button><button class="btn" type="button">Operations</button>
          <button class="btn" type="button" data-act="new-dashboard"${full ? ' data-full="1"' : ""}>+ New dashboard</button></div>
        <div class="cols k">${[["Revenue (MTD)", "$184,320", "+12.4%"], ["Active customers", "3,921", "+4.1%"], ["Churn", "1.8%", "−0.3 pts"], ["Avg. order value", "$47.10", "−2.2%", 1]]
          .map(([l, v, d, down]) => `<div class="panel kpi"><div class="l">${l}</div><div class="v">${v}</div><div class="d${down ? " down" : ""}">${d} vs Aug</div></div>`).join("")}</div>
        <div class="cols h"><div class="panel"><h3>Revenue per day, September</h3>${lineChart(series(30, 7, 5200, 1400))}</div>
          <div class="panel"><h3>Orders by channel</h3>${barChart([420, 310, 260, 190, 120], ["Web", "App", "Retail", "Partner", "Other"])}</div></div>`;
    },
    sources: (s) => {
      const list = [["Google Sheets", "Synced 2 min ago"], ["PostgreSQL", "Synced 5 min ago"], ["Stripe", "Synced 12 min ago"], ["HubSpot", "Synced 1 h ago"],
        ["Shopify", "Synced 3 h ago"], ["Snowflake", "Synced 3 h ago"], ["Salesforce", "Synced today"], ["BigQuery", "Synced today"]];
      return `<div class="panel">${list.map(([n, m], i) => {
        const on = i < s.usage.sources;
        return `<div class="row"><div class="av" style="background:var(--accent)">${n[0]}</div><div class="grow"><b>${n}</b><div class="meta">${on ? m : "Available"}</div></div>
          ${on ? '<span class="pill on">Connected</span>' : `<button class="btn" type="button" data-act="connect" data-name="${n}">Connect</button>`}</div>`;
      }).join("")}</div>`;
    },
    insights: () => `
      ${[["Revenue up 12%, driven by the app", "App orders rose 31% after the 14 Sep release while web stayed flat. Consider moving 10% of paid spend to app-install campaigns."],
         ["Average order value is slipping", "AOV fell 2.2%, mostly first-time buyers using the WELCOME15 code. Returning-customer AOV is unchanged."],
         ["Churn risk: 38 accounts", "Logins at these accounts fell 60%+ in two weeks. 21 of them renew an annual plan within 60 days."]]
        .map(([t, b], i) => `<div class="panel insight"><span class="chip">AI insight</span><h3>${t}</h3><p${i === 0 ? ` class="typing" data-text="${esc(b)}"` : ""}>${i === 0 ? "" : b}</p></div>`).join("")}
      <div class="panel"><h3>Ask Visiro</h3><form class="ask" data-form="ask"><input id="ask-q" placeholder="e.g. Why did churn go up in August?" aria-label="Question">
        <button class="btn btn-primary" type="submit">Ask</button></form><p class="meta answer" style="margin:.6rem 0 0"></p></div>`,
    reports: () => `<div class="panel">${[["Weekly revenue summary", "Mondays 08:00 · email · 6 recipients"], ["Monthly board pack", "1st of month · PDF · 3 recipients"], ["Daily ops snapshot", "Weekdays 07:30 · Slack #ops"]]
      .map(([n, m]) => `<div class="row"><div class="grow"><b>${n}</b><div class="meta">${m}</div></div><span class="pill on">Active</span><button class="btn" type="button" data-act="send-now" data-name="${n}">Send now</button></div>`).join("")}</div>`,
    team: (s) => {
      const people = [["Ava Martin", "Admin"], ["Jonas Petrauskas", "Editor"], ["Priya Shah", "Editor"], ["Leo Chen", "Viewer"], ["Sara Kim", "Viewer"]];
      const colors = ["#0f766e", "#b45309", "#1d4ed8", "#7c3aed", "#be123c"];
      return `<div class="panel">${people.map(([n, r], i) => `<div class="row"><div class="av" style="background:${colors[i]}">${n.split(" ").map((x) => x[0]).join("")}</div>
          <div class="grow"><b>${n}</b><div class="meta">${r}</div></div><span class="pill">${3 + i} dashboards</span></div>`).join("")}
        <div class="row"><button class="btn" type="button" data-act="invite">+ Invite teammate</button></div></div>`;
    },
    alerts: () => `<div class="panel">${[["Revenue drops more than 15% day-over-day", "Email + Slack", 1], ["Churn goes above 2.5%", "Email", 1], ["New enterprise lead in HubSpot", "Slack #sales", 0]]
      .map(([n, m, on]) => `<div class="row"><div class="grow"><b>${n}</b><div class="meta">${m}</div></div><button class="pill${on ? " on" : ""}" type="button" data-act="toggle">${on ? "On" : "Off"}</button></div>`).join("")}</div>`,
    api: () => `<div class="cols h"><div class="panel"><h3>REST API</h3><pre class="code">curl https://api.visiro.example/v1/metrics/revenue \\
  -H "Authorization: Bearer vis_live_••••" \\
  -d range=30d</pre></div>
      <div class="panel"><h3>Embed in your product</h3><pre class="code">&lt;iframe src="https://embed.visiro.example/d/rev"
        width="100%" height="480"&gt;&lt;/iframe&gt;</pre><p class="meta">White-label: your logo, colours and domain.</p></div></div>`,
    sso: () => `<div class="cols h"><div class="panel"><h3>Single sign-on</h3>
        <div class="row"><div class="grow"><b>SAML 2.0</b><div class="meta">Okta · acme.okta.com</div></div><span class="pill on">Enforced</span></div>
        <div class="row"><div class="grow"><b>SCIM provisioning</b><div class="meta">412 users synced</div></div><span class="pill on">On</span></div></div>
      <div class="panel"><h3>Audit log</h3><div class="tbl"><table><tr><th>Time</th><th>User</th><th>Action</th></tr>
        ${[["09:41", "ava@acme.com", "Exported board pack"], ["09:12", "leo@acme.com", "Viewed Revenue overview"], ["08:55", "scim-bot", "Added sara@acme.com"]]
          .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table></div></div></div>`,
  };

  function compareScreen(s) {
    const cur = (id) => (id === s.plan ? " cur" : "");
    return `<div class="panel tbl"><table class="compare">
      <tr><th></th>${plans.map((p) => `<th class="${cur(p.id)}">${esc(p.name)}<br><b style="color:var(--ink)">${priceLabel(p)}</b></th>`).join("")}</tr>
      ${[["Seats", "seats"], ["Dashboards", "dashboards"], ["Data sources", "sources"], ["History", "history"]]
        .map(([l, k]) => `<tr><td>${l}</td>${plans.map((p) => `<td class="${cur(p.id)}">${esc(p.limits[k])}</td>`).join("")}</tr>`).join("")}
      ${features.map((f) => `<tr><td>${esc(f.name)}</td>${plans.map((p) => hasFeature(p.id, f) ? `<td class="yes${cur(p.id)}">✓</td>` : `<td class="no${cur(p.id)}">—</td>`).join("")}</tr>`).join("")}
      <tr><td></td>${plans.map((p) => `<td class="${cur(p.id)}"><button type="button" class="btn${p.id === s.plan ? " btn-primary" : ""}" data-plan="${p.id}">${p.id === s.plan ? "Viewing" : "View"}</button></td>`).join("")}</tr>
    </table></div>`;
  }

  // ── Demo component (used full-page and inside deck slides) ───────────────
  function createDemo(root, { plan = "free", view = "dashboards", page = false, onChange } = {}) {
    const s = { plan, view, usage: {} };
    plans.forEach((p) => (s.usage[p.id] = { ...SAMPLE_USAGE[p.id] }));
    const u = () => s.usage[s.plan];

    function toast(msg) {
      const t = root.querySelector(".toast");
      t.textContent = msg;
      t.classList.add("show");
      clearTimeout(toast.t);
      toast.t = setTimeout(() => t.classList.remove("show"), 2400);
    }

    function meter(label, used, limit) {
      const pct = isNum(limit) ? Math.min(100, (used / limit) * 100) : 6;
      const full = isNum(limit) && used >= limit;
      return `<div class="meter">${label}<b>${used.toLocaleString("en-US")} / ${esc(limit)}</b><div class="track${full ? " full" : ""}"><i style="width:${pct}%"></i></div></div>`;
    }

    function render() {
      const p = planById(s.plan), next = plans[rank[p.id] + 1];
      const nav = (id, ic, name, locked) =>
        `<button type="button" class="nav-item${s.view === id ? " active" : ""}${locked ? " locked" : ""}" data-view="${id}"><span class="ic">${esc(ic)}</span>${esc(name)}${locked ? '<span class="lock">locked</span>' : ""}</button>`;
      let body;
      if (s.view === "compare") {
        body = `<div class="vh"><h2>Compare plans</h2><p>Every plan includes everything in the plan before it.</p></div>${compareScreen(s)}`;
      } else {
        const f = features.find((x) => x.id === s.view) || features[0];
        const head = `<div class="vh"><h2>${esc(f.name)}</h2><p>${esc(f.desc)}</p></div>`;
        const inner = SCREENS[f.id](s);
        if (hasFeature(s.plan, f)) body = head + inner;
        else {
          const need = planById(f.minPlan);
          body = head + `<div class="lockwrap"><div class="ghost" aria-hidden="true">${inner}</div><div class="lockcard"><div>
            <span class="chip">${esc(need.name)} feature</span><h3>${esc(f.name)} starts on ${esc(need.name)}</h3>
            <p>${esc(f.desc)} From ${priceLabel(need)} ${esc(need.period)}.</p>
            <button type="button" class="btn btn-primary" data-plan="${need.id}">Switch to ${esc(need.name)}</button></div></div></div>`;
        }
      }
      root.innerHTML = `<div class="demo${page ? " page" : ""}">
        <div class="demo-bar"><span class="lbl">Plan</span><div class="plan-switch" role="group" aria-label="Plan">${plans.map((x) => `<button type="button" data-plan="${x.id}" aria-pressed="${x.id === s.plan}">${esc(x.name)}</button>`).join("")}</div></div>
        <div class="demo-body">
          <nav class="side" aria-label="Screens"><div class="grp">Workspace</div>${features.map((f) => nav(f.id, f.icon, f.name, !hasFeature(s.plan, f))).join("")}
            <div class="grp">Account</div>${nav("compare", "≡", "Compare plans", false)}</nav>
          <div class="work">
            <div class="usage"><div><div class="pname">${esc(p.name)} plan</div><div class="pmeta">${priceLabel(p)} ${esc(p.period)} · ${esc(p.audience)}</div></div>
              ${meter("Seats", u().seats, p.limits.seats)}${meter("Dashboards", u().dashboards, p.limits.dashboards)}${meter("Data sources", u().sources, p.limits.sources)}
              <div class="meter">History<b>${esc(p.limits.history)}</b></div>
              ${next ? `<button type="button" class="btn btn-primary up" data-plan="${next.id}">Upgrade to ${esc(next.name)}</button>` : '<span class="chip up">Top plan</span>'}</div>
            ${body}
          </div>
        </div>
        <div class="toast" role="status"></div></div>`;
      typeIn();
      onChange && onChange(s.plan, s.view);
    }

    function typeIn() {
      const el = root.querySelector(".typing");
      if (!el) return;
      const text = el.dataset.text;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = text; return; }
      let i = 0;
      el.classList.add("caret");
      (function tick() {
        if (!el.isConnected) return;
        el.textContent = text.slice(0, (i += 2));
        if (i < text.length) setTimeout(tick, 16);
        else el.classList.remove("caret");
      })();
    }

    const nextFor = (key) => plans.find((x) => rank[x.id] > rank[s.plan] && (!isNum(x.limits[key]) || x.limits[key] > u()[key]));

    root.addEventListener("click", (e) => {
      const t = e.target.closest("[data-plan],[data-view],[data-act]");
      if (!t || !root.contains(t)) return;
      if (t.dataset.plan) {
        const changed = t.dataset.plan !== s.plan;
        s.plan = t.dataset.plan;
        render();
        if (changed) toast(`Showing the ${planById(s.plan).name} plan`);
        return;
      }
      if (t.dataset.view) { s.view = t.dataset.view; render(); return; }
      const p = planById(s.plan);
      switch (t.dataset.act) {
        case "new-dashboard":
          if (t.dataset.full) { const n = nextFor("dashboards"); toast(`You've used all ${p.limits.dashboards} dashboards. ${n.name} gives you ${n.limits.dashboards}.`); }
          else { u().dashboards++; render(); toast("Dashboard created"); }
          break;
        case "connect":
          if (isNum(p.limits.sources) && u().sources >= p.limits.sources) { const n = nextFor("sources"); toast(`You've used all ${p.limits.sources} data sources. ${n.name} gives you ${n.limits.sources}.`); }
          else { u().sources++; render(); toast(`${t.dataset.name} connected`); }
          break;
        case "invite":
          if (isNum(p.limits.seats) && u().seats >= p.limits.seats) { const n = nextFor("seats"); toast(`All ${p.limits.seats} seats are taken. ${n.name} gives you ${n.limits.seats}.`); }
          else { u().seats++; render(); toast("Invite sent"); }
          break;
        case "send-now": toast(`${t.dataset.name} sent`); break;
        case "toggle": { const on = t.classList.toggle("on"); t.textContent = on ? "On" : "Off"; toast(on ? "Alert turned on" : "Alert turned off"); break; }
      }
    });
    root.addEventListener("submit", (e) => {
      if (!e.target.matches("[data-form=ask]")) return;
      e.preventDefault();
      root.querySelector(".answer").textContent =
        "Sample answer: churn rose in August mainly among monthly Pro customers who never connected a second data source. An onboarding nudge could win back about 40% of them.";
    });

    render();
  }

  // ── Pages ───────────────────────────────────────────────────────────────
  const app = document.getElementById("app");
  const SAMPLE = `<div class="sample-note"><b>Sample content.</b> Product copy, plans, prices and pitch numbers are placeholders.</div>`;
  const shell = (active, main) => `
    <header class="site-nav"><a class="wordmark" href="#home"><span class="mark" aria-hidden="true"></span>${esc(product.name)}</a>
      <nav aria-label="Sections">${[["home", "Overview"], ["demo", "Live demo"], ["deck", "Pitch deck"]]
        .map(([id, l]) => `<a href="#${id}"${active === id ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav></header>
    ${SAMPLE}<main>${main}</main>`;

  function homePage() {
    app.className = "";
    app.innerHTML = shell("home", `<div class="home">
      <section><span class="chip">Investor preview</span><h1>${esc(product.tagline)}</h1><p class="lead">${esc(product.oneLiner)}</p>
        <div class="actions"><a class="btn btn-primary" href="#deck">Start the pitch deck</a><a class="btn" href="#demo">Try the live demo</a></div></section>
      <section><h2>Try each plan</h2><div class="plan-grid">${plans.map((p) => `
        <a class="plan-tile${p.highlight ? " hl" : ""}" href="#demo-${p.id}"><span class="chip">${esc(p.name)}</span>
          <span class="price">${priceLabel(p)}</span><span class="per">${esc(p.period)}</span><span class="who">${esc(p.audience)}</span>
          <span class="go">Open ${esc(p.name)} demo →</span></a>`).join("")}</div></section></div>`);
  }

  function demoPage(plan, view) {
    app.className = "";
    app.innerHTML = shell("demo", `<div id="demo-root"></div>`);
    createDemo(document.getElementById("demo-root"), {
      plan, view, page: true,
      onChange: (p, v) => history.replaceState(null, "", `#demo-${p}-${v}`),
    });
  }

  let deckKeys = null, deckResize = null;
  function deckPage(start) {
    app.className = "fill";
    const foot = `<div class="sfoot"><span>${esc(product.name)} · investor pitch</span><b>Sample content</b></div>`;
    const slides = [
      `<section class="slide cover"><div class="mark" aria-hidden="true"></div><h1>${esc(product.name)}</h1>
        <p class="lead" style="color:var(--ink);font-size:34px;font-weight:600">${esc(product.tagline)}</p>
        <p class="lead" style="margin-top:14px">${esc(product.oneLiner)}</p>${foot}</section>`,
      `<section class="slide"><div class="eyebrow">Problem</div><h2>Decisions get made without clear numbers</h2><ul class="pts">${pitch.problem.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>${foot}</section>`,
      `<section class="slide"><div class="eyebrow">Solution</div><h2>${esc(product.name)} makes the numbers obvious</h2><ul class="pts">${pitch.solution.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>${foot}</section>`,
      `<section class="slide"><div class="eyebrow">Business model</div><h2>Four plans, one upgrade path</h2>
        <div class="prices">${plans.map((p) => `<div class="pc${p.highlight ? " hl" : ""}"><div class="nm">${esc(p.name)}</div><div class="pr">${priceLabel(p)}</div>
          <div class="pd">${esc(p.period)}</div><div class="pd">${esc(p.audience)}</div><ul>${newIn(p).map((f) => `<li>${esc(f.name)}</li>`).join("")}</ul></div>`).join("")}</div>
        <p class="lead" style="margin-top:26px;font-size:21px">Each plan includes everything in the plan before it. The next ${plans.length} slides show each plan live.</p>${foot}</section>`,
      ...plans.map((p, i) => `<section class="slide planslide" data-plan="${p.id}">
        <div class="info"><div class="eyebrow">Live demo · plan ${i + 1} of ${plans.length}</div><h2>${esc(p.name)}</h2>
          <div class="pr">${priceLabel(p)} <span>${esc(p.period)}</span></div><div style="color:var(--muted);font-size:18px">${esc(p.audience)}</div>
          <ul><li>${esc(p.limits.seats)} seats, ${esc(p.limits.dashboards)} dashboards</li><li>${esc(p.limits.sources)} data sources, ${esc(p.limits.history)} history</li>
            ${newIn(p).map((f) => `<li><b>New:</b> ${esc(f.name)}</li>`).join("")}</ul>
          <div class="why">${esc(p.pitch)}</div>
          <div class="small">Click around in the demo on the right, or <a href="#demo-${p.id}">open it full screen</a>.</div></div>
        <div class="embed"><span class="chip live">Live</span><div class="embed-inner"></div></div></section>`),
      `<section class="slide"><div class="eyebrow">Market</div><h2>A large market that needs a simpler product</h2><div class="tiles">
        <div class="tile"><div class="n">${esc(pitch.market.tam)}</div><div class="t">TAM: global BI and analytics software</div></div>
        <div class="tile"><div class="n">${esc(pitch.market.sam)}</div><div class="t">SAM: self-serve analytics for small and mid-sized companies</div></div>
        <div class="tile"><div class="n">${esc(pitch.market.som)}</div><div class="t">SOM: realistic share within 5 years</div></div></div>${foot}</section>`,
      `<section class="slide"><div class="eyebrow">Traction</div><h2>Early signal</h2><div class="tiles">${pitch.traction.map((t) => `<div class="tile"><div class="n">${esc(t.value)}</div><div class="t">${esc(t.label)}</div></div>`).join("")}</div>${foot}</section>`,
      `<section class="slide"><div class="eyebrow">The ask</div><h2>Raising ${esc(pitch.ask.amount)}</h2>
        <div class="alloc">${pitch.ask.use.map((x) => `<div>${esc(x.label)} · <b>${x.pct}%</b><div class="bar" style="width:${x.pct}%"></div></div>`).join("")}</div>
        <p class="lead" style="margin-top:30px">${esc(pitch.ask.runway)} of runway to reach product-market fit across all four plans.</p>${foot}</section>`,
      `<section class="slide cover"><div class="mark" aria-hidden="true"></div><h1>Thank you</h1><p class="lead" style="font-size:28px;user-select:all">${esc(pitch.contact)}</p>${foot}</section>`,
    ];
    app.innerHTML = shell("deck", `<div class="deck-page"><div class="deck-viewport"><div class="stage">${slides.join("")}</div></div>
      <div class="deck-ctl"><button class="btn" type="button" data-go="-1" aria-label="Previous slide">←</button><span class="count"></span>
        <button class="btn" type="button" data-go="1" aria-label="Next slide">→</button><span class="hint">Arrow keys also work</span></div></div>`);

    const vp = app.querySelector(".deck-viewport"), stage = app.querySelector(".stage");
    const els = [...stage.querySelectorAll(".slide")];
    let idx = Math.min(els.length - 1, Math.max(0, start - 1));
    const fit = () => {
      const k = Math.min(vp.clientWidth / 1320, vp.clientHeight / 760);
      stage.style.transform = `translate(-50%, -50%) scale(${k})`;
    };
    const show = (i) => {
      idx = Math.min(els.length - 1, Math.max(0, i));
      els.forEach((el, j) => el.classList.toggle("on", j === idx));
      const inner = els[idx].querySelector(".embed-inner");
      if (inner && !inner.dataset.ready) {
        inner.dataset.ready = "1";
        const p = planById(els[idx].dataset.plan);
        createDemo(inner, { plan: p.id, view: (newIn(p)[0] || features[0]).id });
      }
      app.querySelector(".count").textContent = `${idx + 1} / ${els.length}`;
      history.replaceState(null, "", `#deck-${idx + 1}`);
    };
    app.querySelector(".deck-ctl").addEventListener("click", (e) => {
      const b = e.target.closest("[data-go]");
      if (b) show(idx + Number(b.dataset.go));
    });
    deckKeys = (e) => {
      if (e.target.closest("input, textarea")) return;
      if (["ArrowRight", "PageDown"].includes(e.key)) { e.preventDefault(); show(idx + 1); }
      else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); show(idx - 1); }
      else if (e.key === "Home") show(0);
      else if (e.key === "End") show(els.length - 1);
    };
    deckResize = fit;
    document.addEventListener("keydown", deckKeys);
    window.addEventListener("resize", deckResize);
    fit();
    show(idx);
  }

  // ── Router ──────────────────────────────────────────────────────────────
  function route() {
    if (deckKeys) { document.removeEventListener("keydown", deckKeys); window.removeEventListener("resize", deckResize); deckKeys = deckResize = null; }
    const [page, a, b] = (location.hash.slice(1) || "home").split("-");
    if (page === "demo") {
      const plan = rank[a] !== undefined ? a : "free";
      const view = b === "compare" || features.some((f) => f.id === b) ? b : "dashboards";
      demoPage(plan, view);
    } else if (page === "deck") deckPage(parseInt(a, 10) || 1);
    else homePage();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();
