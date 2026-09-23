(() => {
  const C = window.VISIRO;
  const plans = C.plans;
  const rank = Object.fromEntries(plans.map((p, i) => [p.id, i]));
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Sample usage per plan, so the limit meters look realistic in each preview.
  const usage = {
    free: { seats: 1, dashboards: 3, sources: 2 },
    pro: { seats: 3, dashboards: 9, sources: 6 },
    business: { seats: 18, dashboards: 64, sources: 21 },
    enterprise: { seats: 412, dashboards: 1380, sources: 140 },
  };

  const params = new URLSearchParams(location.search);
  let state = {
    plan: rank[params.get("plan")] !== undefined ? params.get("plan") : "free",
    view: location.hash.slice(1) || "dashboards",
  };

  const planById = (id) => plans.find((p) => p.id === id);
  const unlocked = (feature) => rank[state.plan] >= rank[feature.minPlan];
  const priceLabel = (p) => (p.price === null ? "Custom" : p.price === 0 ? "$0" : `$${p.price}`);

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function setPlan(id, announce = true) {
    state.plan = id;
    const url = new URL(location.href);
    url.searchParams.set("plan", id);
    history.replaceState(null, "", url);
    render();
    if (announce) toast(`Now previewing the ${planById(id).name} plan`);
  }

  function setView(id) {
    state.view = id;
    history.replaceState(null, "", `${location.pathname}${location.search}#${id}`);
    render();
  }

  // ── Chrome ────────────────────────────────────────────────────────────────
  function renderSwitch() {
    $("#plan-switch").innerHTML = plans
      .map((p) => `<button role="tab" data-plan="${p.id}" aria-selected="${p.id === state.plan}">${esc(p.name)}</button>`)
      .join("");
  }

  function renderSidebar() {
    const item = (id, icon, name, locked) =>
      `<button class="nav-item ${state.view === id ? "active" : ""} ${locked ? "locked" : ""}" data-view="${id}">
         <span class="ic">${esc(icon)}</span>${esc(name)}${locked ? '<span class="lock">🔒</span>' : ""}
       </button>`;
    $("#sidebar").innerHTML =
      `<div class="section-label">Workspace</div>` +
      C.features.map((f) => item(f.id, f.icon, f.name, !unlocked(f))).join("") +
      `<div class="section-label">Account</div>` +
      item("compare", "≡", "Compare plans", false);
  }

  function renderStrip() {
    const p = planById(state.plan);
    const u = usage[p.id];
    const meter = (label, used, limit) => {
      const unlimited = typeof limit !== "number";
      const pct = unlimited ? Math.min(100, 8 + (used % 30)) : Math.min(100, (used / limit) * 100);
      const full = !unlimited && used >= limit;
      return `<div class="meter">${label}<b>${used.toLocaleString()} / ${esc(limit)}</b>
                <div class="bar ${full ? "full" : ""}"><i style="width:${pct}%"></i></div></div>`;
    };
    const next = plans[rank[p.id] + 1];
    $("#plan-strip").innerHTML = `
      <div><div class="name">${esc(p.name)} plan</div>
        <div class="meta" style="color:var(--muted);font-size:.85rem">${priceLabel(p)} ${esc(p.period)} · ${esc(p.audience)}</div></div>
      ${meter("Seats", u.seats, p.limits.seats)}
      ${meter("Dashboards", u.dashboards, p.limits.dashboards)}
      ${meter("Data sources", u.sources, p.limits.sources)}
      <div class="meter">History<b>${esc(p.limits.history)}</b></div>
      ${next ? `<button class="btn btn-primary" style="margin-left:auto" data-plan="${next.id}">Upgrade to ${esc(next.name)}</button>` : `<span class="badge" style="margin-left:auto">Top tier</span>`}`;
  }

  // ── Mock charts ───────────────────────────────────────────────────────────
  function series(n, seed, base, amp) {
    let x = seed;
    const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: n }, (_, i) => base + i * amp * 0.08 + (rnd() - 0.4) * amp);
  }
  function lineChart(data) {
    const w = 600, h = 180, pad = 8;
    const min = Math.min(...data), max = Math.max(...data);
    const pts = data.map((v, i) => [pad + (i / (data.length - 1)) * (w - 2 * pad), h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad)]);
    const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <path d="${d}L${w - pad},${h}L${pad},${h}Z" fill="var(--accent)" opacity=".12"/>
      <path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg>`;
  }
  function barChart(data, labels) {
    const w = 600, h = 180, max = Math.max(...data), bw = w / data.length;
    return `<svg class="chart" viewBox="0 0 ${w} ${h + 18}" preserveAspectRatio="none" aria-hidden="true">
      ${data.map((v, i) => {
        const bh = (v / max) * (h - 10);
        return `<rect x="${i * bw + bw * 0.2}" y="${h - bh}" width="${bw * 0.6}" height="${bh}" rx="4" fill="var(--accent)" opacity="${0.45 + (v / max) * 0.55}"/>
                <text x="${i * bw + bw / 2}" y="${h + 14}" text-anchor="middle" font-size="12" fill="var(--muted)">${labels[i]}</text>`;
      }).join("")}</svg>`;
  }

  // ── Feature views ─────────────────────────────────────────────────────────
  const views = {
    dashboards() {
      const p = planById(state.plan), u = usage[p.id];
      const full = typeof p.limits.dashboards === "number" && u.dashboards >= p.limits.dashboards;
      return `
        <div class="tabs">
          <button class="btn btn-primary">Revenue overview</button><button class="btn">Marketing</button><button class="btn">Operations</button>
          <button class="btn" data-action="new-dashboard" ${full ? 'data-full="1"' : ""}>＋ New dashboard</button>
        </div>
        <div class="grid kpis">
          ${[["Revenue (MTD)", "$184,320", "+12.4%"], ["Active customers", "3,921", "+4.1%"], ["Churn", "1.8%", "-0.3 pts"], ["Avg. order value", "$47.10", "-2.2%", true]]
            .map(([l, v, d, down]) => `<div class="card kpi"><div class="label">${l}</div><div class="value">${v}</div><div class="delta ${down ? "down" : ""}">${d} vs last month</div></div>`).join("")}
        </div>
        <div class="grid two" style="margin-top:1rem">
          <div class="card"><h3>Revenue, last 30 days</h3>${lineChart(series(30, 7, 5000, 1400))}</div>
          <div class="card"><h3>Orders by channel</h3>${barChart([420, 310, 260, 190, 120], ["Web", "App", "Retail", "Partner", "Other"])}</div>
        </div>`;
    },
    sources() {
      const p = planById(state.plan), u = usage[p.id];
      const list = [["Google Sheets", "Synced 2 min ago", true], ["PostgreSQL", "Synced 5 min ago", true], ["Stripe", "Synced 12 min ago", u.sources > 2],
        ["HubSpot", "Not connected", u.sources > 3], ["Shopify", "Not connected", u.sources > 4], ["Snowflake", "Not connected", u.sources > 10]];
      return `<div class="card">${list.map(([n, m, on]) => `
          <div class="row"><div class="avatar" style="background:var(--accent)">${n[0]}</div>
            <div class="grow"><b>${n}</b><div class="meta">${on ? m : "Available"}</div></div>
            ${on ? '<span class="pill on">Connected</span>' : `<button class="btn" data-action="connect" data-name="${n}">Connect</button>`}</div>`).join("")}
        </div>`;
    },
    insights() {
      return `<div class="grid">
        ${[["Revenue up 12% driven by the App channel", "App orders rose 31% after the 14 Sep release. Web was flat. Consider shifting 10% of paid spend to app install campaigns."],
           ["Average order value is slipping", "AOV dropped 2.2%, mostly from first-time buyers using the WELCOME15 code. Returning-customer AOV is unchanged."],
           ["Churn risk: 38 accounts", "These accounts' logins fell by 60%+ in two weeks. 21 are on annual plans renewing within 60 days."]]
          .map(([t, b], i) => `<div class="card insight"><span class="badge">✦ AI insight</span><h3 style="margin:.5rem 0 0">${t}</h3><p class="${i === 0 ? "typing" : ""}" data-text="${esc(b)}">${i === 0 ? "" : esc(b)}</p></div>`).join("")}
        <div class="card"><h3>Ask Visiro</h3><div style="display:flex;gap:.5rem">
          <input id="ask" placeholder="e.g. Why did churn go up in August?" style="flex:1;padding:.6rem;border-radius:10px;border:1px solid var(--border);background:var(--surface-2);color:var(--text)">
          <button class="btn btn-primary" data-action="ask">Ask</button></div><p id="answer" class="meta" style="margin-bottom:0"></p></div>
      </div>`;
    },
    reports() {
      return `<div class="card">${[["Weekly revenue summary", "Every Monday 08:00 · 6 recipients"], ["Monthly board pack", "1st of month · PDF · 3 recipients"], ["Daily ops snapshot", "Weekdays 07:30 · Slack #ops"]]
        .map(([n, m]) => `<div class="row"><div class="grow"><b>${n}</b><div class="meta">${m}</div></div><span class="pill on">Active</span><button class="btn" data-action="send-now">Send now</button></div>`).join("")}</div>`;
    },
    team() {
      const colors = ["#4f46e5", "#0f9d6b", "#c2410c", "#0e7490", "#9333ea"];
      return `<div class="card">${[["Ava Martin", "Admin"], ["Jonas Petrauskas", "Editor"], ["Priya Shah", "Editor"], ["Leo Chen", "Viewer"], ["Sara Kim", "Viewer"]]
        .map(([n, r], i) => `<div class="row"><div class="avatar" style="background:${colors[i]}">${n.split(" ").map((x) => x[0]).join("")}</div>
          <div class="grow"><b>${n}</b><div class="meta">${r}</div></div><span class="pill">${3 + i} dashboards</span></div>`).join("")}
        <div class="row"><button class="btn" data-action="invite">＋ Invite teammate</button></div></div>`;
    },
    alerts() {
      return `<div class="card">${[["Revenue drops more than 15% day-over-day", "Email + Slack", true], ["Churn exceeds 2.5%", "Email", true], ["New enterprise lead in HubSpot", "Slack #sales", false]]
        .map(([n, m, on]) => `<div class="row"><span style="font-size:1.2rem">⚑</span><div class="grow"><b>${n}</b><div class="meta">${m}</div></div>
          <button class="pill ${on ? "on" : ""}" style="border:0" data-action="toggle-alert">${on ? "On" : "Off"}</button></div>`).join("")}</div>`;
    },
    api() {
      return `<div class="grid two">
        <div class="card"><h3>REST API</h3><pre class="code">curl https://api.visiro.example/v1/metrics/revenue \\
  -H "Authorization: Bearer vis_live_••••••••" \\
  -d range=30d</pre></div>
        <div class="card"><h3>Embed in your product</h3><pre class="code">&lt;iframe src="https://embed.visiro.example/d/rev-overview"
        width="100%" height="480"&gt;&lt;/iframe&gt;</pre>
        <p class="meta">White-label: your logo, your colours, your domain.</p></div></div>`;
    },
    sso() {
      return `<div class="grid two">
        <div class="card"><h3>Single sign-on</h3>
          <div class="row"><div class="grow"><b>SAML 2.0</b><div class="meta">Okta · acme.okta.com</div></div><span class="pill on">Enforced</span></div>
          <div class="row"><div class="grow"><b>SCIM provisioning</b><div class="meta">412 users synced</div></div><span class="pill on">On</span></div></div>
        <div class="card"><h3>Audit log</h3><table><tr><th>Time</th><th>User</th><th>Action</th></tr>
          ${[["09:41", "ava@acme.com", "Exported Board pack"], ["09:12", "leo@acme.com", "Viewed Revenue overview"], ["08:55", "scim-bot", "Provisioned sara@acme.com"]]
            .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table></div></div>`;
    },
  };

  function renderCompare() {
    const cell = (ok, pid) => `<td class="${ok ? "yes" : "no"} ${pid === state.plan ? "current" : ""}">${ok ? "✓" : "—"}</td>`;
    const head = plans.map((p) => `<th class="${p.id === state.plan ? "current" : ""}">${esc(p.name)}<br><span style="font-weight:800;color:var(--text)">${priceLabel(p)}</span></th>`).join("");
    const limitRow = (label, key) => `<tr><td>${label}</td>${plans.map((p) => `<td class="${p.id === state.plan ? "current" : ""}">${esc(p.limits[key])}</td>`).join("")}</tr>`;
    return `<h1>Compare plans</h1><p class="sub">Click a plan name to preview it.</p>
      <div class="card compare-wrap"><table class="compare">
        <tr><th></th>${head}</tr>
        ${limitRow("Seats", "seats")}${limitRow("Dashboards", "dashboards")}${limitRow("Data sources", "sources")}${limitRow("History", "history")}
        ${C.features.map((f) => `<tr><td>${esc(f.name)}</td>${plans.map((p) => cell(rank[p.id] >= rank[f.minPlan], p.id)).join("")}</tr>`).join("")}
        <tr><td></td>${plans.map((p) => `<td class="${p.id === state.plan ? "current" : ""}"><button class="btn ${p.id === state.plan ? "btn-primary" : ""}" data-plan="${p.id}">${p.id === state.plan ? "Previewing" : "Preview"}</button></td>`).join("")}</tr>
      </table></div>`;
  }

  function renderView() {
    const el = $("#view");
    if (state.view === "compare") { el.innerHTML = renderCompare(); return; }
    const f = C.features.find((x) => x.id === state.view) || C.features[0];
    const header = `<h1>${esc(f.icon)} ${esc(f.name)}</h1><p class="sub">${esc(f.desc)}</p>`;
    const body = views[f.id] ? views[f.id]() : "";
    if (unlocked(f)) {
      el.innerHTML = header + body;
      startTyping();
    } else {
      const need = planById(f.minPlan);
      el.innerHTML = header + `<div class="locked-wrap"><div class="preview">${body}</div>
        <div class="lock-card"><div class="inner"><div class="big">🔒</div>
          <h2>${esc(f.name)} is on ${esc(need.name)}</h2>
          <p>${esc(f.desc)} Available from ${priceLabel(need)} ${esc(need.period)}.</p>
          <button class="btn btn-primary" data-plan="${need.id}">Preview ${esc(need.name)}</button></div></div></div>`;
    }
  }

  function startTyping() {
    const p = document.querySelector(".typing");
    if (!p) return;
    const text = p.dataset.text;
    let i = 0;
    p.classList.add("cursor");
    const tick = () => {
      if (!p.isConnected) return;
      p.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, 14);
      else p.classList.remove("cursor");
    };
    tick();
  }

  function render() {
    $("#brand-name").textContent = C.product.name;
    renderSwitch();
    renderSidebar();
    renderStrip();
    renderView();
  }

  // ── Events ────────────────────────────────────────────────────────────────
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-plan],[data-view],[data-action]");
    if (!t) return;
    if (t.dataset.plan) return setPlan(t.dataset.plan);
    if (t.dataset.view) return setView(t.dataset.view);

    const p = planById(state.plan), u = usage[p.id];
    const nextFor = (key) => plans.find((x) => typeof x.limits[key] !== "number" || x.limits[key] > u[key]);
    switch (t.dataset.action) {
      case "new-dashboard":
        if (t.dataset.full) { const n = nextFor("dashboards"); toast(`Dashboard limit reached (${p.limits.dashboards}). ${n.name} raises it to ${n.limits.dashboards}.`); }
        else { u.dashboards++; renderStrip(); toast("Dashboard created"); }
        break;
      case "connect":
        if (typeof p.limits.sources === "number" && u.sources >= p.limits.sources) {
          const n = nextFor("sources"); toast(`Source limit reached. ${n.name} allows ${n.limits.sources}.`);
        } else { u.sources++; render(); toast(`${t.dataset.name} connected`); }
        break;
      case "invite":
        if (typeof p.limits.seats === "number" && u.seats >= p.limits.seats) toast(`All ${p.limits.seats} seats used.`);
        else { u.seats++; renderStrip(); toast("Invite sent"); }
        break;
      case "ask":
        $("#answer").textContent = "Churn rose in August mainly among monthly Pro customers who never connected a second data source. Onboarding nudges could recover ~40% of them. (sample answer)";
        break;
      case "send-now": toast("Report sent"); break;
      case "toggle-alert": {
        const on = t.classList.toggle("on"); t.textContent = on ? "On" : "Off"; break;
      }
    }
  });

  window.addEventListener("hashchange", () => { state.view = location.hash.slice(1) || "dashboards"; render(); });
  render();
})();
