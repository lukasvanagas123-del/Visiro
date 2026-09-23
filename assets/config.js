// ─────────────────────────────────────────────────────────────────────────────
// Visiro — single source of truth for the pitch demo and the pitch deck.
//
// EVERYTHING BELOW MARKED "PLACEHOLDER" IS INVENTED SAMPLE CONTENT.
// Replace it with the real product description, plans, prices and numbers
// before showing this to investors. Both /demo and /deck read from this file,
// so editing it here updates everything.
// ─────────────────────────────────────────────────────────────────────────────

window.VISIRO = {
  product: {
    name: "Visiro",
    tagline: "See your business clearly.", // PLACEHOLDER
    oneLiner:
      "Visiro turns scattered business data into live visual dashboards and AI-written insights, so teams act in minutes instead of weeks.", // PLACEHOLDER
  },

  // Feature catalogue. `minPlan` is the id of the cheapest plan that unlocks it.
  features: [
    { id: "dashboards", name: "Live dashboards", icon: "▦", minPlan: "free",
      desc: "Drag-and-drop charts that refresh in real time." },
    { id: "sources", name: "Data connectors", icon: "⇄", minPlan: "free",
      desc: "Connect spreadsheets, databases and SaaS tools." },
    { id: "insights", name: "AI insights", icon: "✦", minPlan: "pro",
      desc: "Plain-language summaries of what changed and why." },
    { id: "reports", name: "Scheduled reports", icon: "✉", minPlan: "pro",
      desc: "Email PDF reports to anyone on a schedule." },
    { id: "team", name: "Team workspaces", icon: "◎", minPlan: "business",
      desc: "Shared dashboards, roles and comments." },
    { id: "alerts", name: "Smart alerts", icon: "⚑", minPlan: "business",
      desc: "Get notified the moment a metric breaks trend." },
    { id: "api", name: "API & embedding", icon: "</>", minPlan: "enterprise",
      desc: "Embed dashboards in your own product." },
    { id: "sso", name: "SSO & audit log", icon: "⚿", minPlan: "enterprise",
      desc: "SAML SSO, SCIM and full audit trail." },
  ],

  // Plans, cheapest first. PLACEHOLDER names, prices and limits.
  plans: [
    {
      id: "free", name: "Free", price: 0, period: "forever",
      audience: "Freelancers trying Visiro",
      limits: { seats: 1, dashboards: 3, sources: 2, history: "7 days" },
      pitch: "Zero-friction entry point that feeds the funnel.",
    },
    {
      id: "pro", name: "Pro", price: 19, period: "per user / month",
      audience: "Solo operators & small teams",
      limits: { seats: 3, dashboards: 25, sources: 10, history: "1 year" },
      pitch: "AI insights are the aha moment that drives upgrades.",
      highlight: true,
    },
    {
      id: "business", name: "Business", price: 49, period: "per user / month",
      audience: "Growing companies (10–200 staff)",
      limits: { seats: 50, dashboards: "Unlimited", sources: 50, history: "3 years" },
      pitch: "Collaboration expands seats inside each account.",
    },
    {
      id: "enterprise", name: "Enterprise", price: null, period: "annual contract",
      audience: "Large organisations",
      limits: { seats: "Unlimited", dashboards: "Unlimited", sources: "Unlimited", history: "Unlimited" },
      pitch: "Security, API and embedding unlock six-figure contracts.",
    },
  ],

  // Pitch deck narrative. PLACEHOLDER numbers.
  pitch: {
    problem: [
      "Teams juggle 10+ tools and still can't answer 'how are we doing?'",
      "BI software is built for analysts, not the people making decisions",
      "Insights arrive weeks late, after the moment to act has passed",
    ],
    solution: [
      "Connect data in minutes, no SQL required",
      "Live visual dashboards everyone understands",
      "AI explains what changed and recommends the next step",
    ],
    market: { tam: "$30B", sam: "$6B", som: "$120M" },
    traction: [
      { label: "Waitlist sign-ups", value: "2,400" },
      { label: "Pilot customers", value: "12" },
      { label: "Free → Pro conversion (pilot)", value: "7%" },
    ],
    ask: {
      amount: "$750K pre-seed",
      use: [
        { label: "Product & engineering", pct: 55 },
        { label: "Go-to-market", pct: 30 },
        { label: "Operations", pct: 15 },
      ],
      runway: "18 months",
    },
    contact: "hello@visiro.example", // PLACEHOLDER
  },
};
