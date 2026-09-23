(() => {
  const C = window.VISIRO;
  const { product, plans, features, pitch } = C;
  const rank = Object.fromEntries(plans.map((p, i) => [p.id, i]));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const priceLabel = (p) => (p.price === null ? "Custom" : p.price === 0 ? "$0" : `$${p.price}`);
  const featuresFor = (p) => features.filter((f) => rank[p.id] >= rank[f.minPlan]);
  const newIn = (p) => features.filter((f) => f.minPlan === p.id);
  const foot = (n) => `<div class="foot"><span>${esc(product.name)} · Investor pitch</span><span class="placeholder-tag">Placeholder content — edit assets/config.js</span></div>`;

  const slides = [
    `<section class="slide title-slide">
       <div class="logo">◐</div>
       <h1>${esc(product.name)}</h1>
       <p class="lead" style="font-size:32px;color:var(--text);font-weight:600">${esc(product.tagline)}</p>
       <p class="lead" style="margin-top:16px">${esc(product.oneLiner)}</p>
       ${foot()}
     </section>`,

    `<section class="slide"><div class="kicker">The problem</div><h2>Decisions are made blind</h2>
       <ul class="points">${pitch.problem.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>${foot()}</section>`,

    `<section class="slide"><div class="kicker">The solution</div><h2>${esc(product.name)} makes the numbers obvious</h2>
       <ul class="points">${pitch.solution.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>${foot()}</section>`,

    `<section class="slide"><div class="kicker">Business model</div><h2>Four plans, one upgrade path</h2>
       <div class="cols c4">${plans.map((p) => `
         <div class="price-card ${p.highlight ? "hl" : ""}">
           <div class="nm">${esc(p.name)} ${p.highlight ? '<span class="badge">Most popular</span>' : ""}</div>
           <div class="pr">${priceLabel(p)}</div><div class="pd">${esc(p.period)}</div>
           <div class="pd">${esc(p.audience)}</div>
           <ul>${newIn(p).map((f) => `<li>${esc(f.name)}</li>`).join("") || "<li>Core features</li>"}</ul>
         </div>`).join("")}</div>
       <p class="lead" style="margin-top:28px;font-size:20px">Each plan includes everything in the plan before it. The next slides show each plan live.</p>${foot()}</section>`,

    ...plans.map((p, i) => `
      <section class="slide plan-slide" data-plan="${p.id}">
        <div class="info">
          <div class="kicker">Live demo · Plan ${i + 1} of ${plans.length}</div>
          <h2>${esc(p.name)}</h2>
          <div class="pr">${priceLabel(p)} <span style="font-size:16px;color:var(--muted);font-weight:500">${esc(p.period)}</span></div>
          <p style="color:var(--muted);font-size:18px">${esc(p.audience)}</p>
          <ul>
            <li>${esc(p.limits.seats)} seats · ${esc(p.limits.dashboards)} dashboards</li>
            <li>${esc(p.limits.sources)} data sources · ${esc(p.limits.history)} history</li>
            ${newIn(p).map((f) => `<li><b>New:</b> ${esc(f.name)}</li>`).join("")}
          </ul>
          <div class="why">${esc(p.pitch)}</div>
          <p style="font-size:14px;color:var(--muted)">${featuresFor(p).length} of ${features.length} features unlocked. The demo on the right is interactive.</p>
        </div>
        <div class="frame-wrap"><span class="badge live">● Live</span>
          <iframe title="${esc(p.name)} plan demo" data-src="../demo/?plan=${p.id}#${(newIn(p)[0] || features[0]).id}"></iframe></div>
      </section>`),

    `<section class="slide"><div class="kicker">Market</div><h2>A large market, with room for a simpler product</h2>
       <div class="cols c3">
         <div class="tile"><div class="big">${esc(pitch.market.tam)}</div><div class="lbl">TAM: global BI & analytics software</div></div>
         <div class="tile"><div class="big">${esc(pitch.market.sam)}</div><div class="lbl">SAM: SMB & mid-market self-serve analytics</div></div>
         <div class="tile"><div class="big">${esc(pitch.market.som)}</div><div class="lbl">SOM: realistic 5-year capture</div></div>
       </div>${foot()}</section>`,

    `<section class="slide"><div class="kicker">Traction</div><h2>Early signal</h2>
       <div class="cols c3">${pitch.traction.map((t) => `<div class="tile"><div class="big">${esc(t.value)}</div><div class="lbl">${esc(t.label)}</div></div>`).join("")}</div>${foot()}</section>`,

    `<section class="slide"><div class="kicker">The ask</div><h2>Raising ${esc(pitch.ask.amount)}</h2>
       <div class="bars">${pitch.ask.use.map((u) => `<div>${esc(u.label)} · <b>${u.pct}%</b><div class="b" style="width:${u.pct}%"></div></div>`).join("")}</div>
       <p class="lead" style="margin-top:32px">${esc(pitch.ask.runway)} runway to reach product-market fit across all four plans.</p>${foot()}</section>`,

    `<section class="slide title-slide"><div class="logo">◐</div><h1>Thank you</h1>
       <p class="lead" style="font-size:28px">${esc(pitch.contact)}</p>${foot()}</section>`,
  ];

  const deck = document.getElementById("deck");
  deck.innerHTML = `<div class="stage" id="stage">${slides.join("")}</div>`;
  const stage = document.getElementById("stage");
  const els = [...stage.querySelectorAll(".slide")];
  let idx = Math.min(els.length - 1, Math.max(0, (parseInt(location.hash.slice(1), 10) || 1) - 1));

  function fit() {
    const s = Math.min(deck.clientWidth / 1320, deck.clientHeight / 760);
    stage.style.transform = `scale(${s})`;
  }

  function show(i) {
    idx = Math.min(els.length - 1, Math.max(0, i));
    els.forEach((el, j) => el.classList.toggle("active", j === idx));
    // Load a plan's live demo only when its slide is shown.
    const frame = els[idx].querySelector("iframe[data-src]");
    if (frame && !frame.src) frame.src = frame.dataset.src;
    document.getElementById("counter").textContent = `${idx + 1} / ${els.length}`;
    history.replaceState(null, "", `#${idx + 1}`);
  }

  document.getElementById("prev").onclick = () => show(idx - 1);
  document.getElementById("next").onclick = () => show(idx + 1);
  document.addEventListener("keydown", (e) => {
    if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); show(idx + 1); }
    if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); show(idx - 1); }
    if (e.key === "Home") show(0);
    if (e.key === "End") show(els.length - 1);
  });
  window.addEventListener("resize", fit);
  fit();
  show(idx);
})();
