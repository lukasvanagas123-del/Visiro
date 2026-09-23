# Visiro: investor pitch and demo

A static site with no build step and no dependencies. It has three parts:

| Path | What it is |
| --- | --- |
| `index.html` | Landing page with links to the deck and a demo for each plan |
| `deck/` | Pitch deck in the browser, with one live demo slide per plan |
| `demo/` | Clickable product demo with a plan switcher (Free / Pro / Business / Enterprise) |
| `assets/config.js` | **The one file to edit:** product copy, plans, prices, features, pitch numbers |

## Run it

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

You can also deploy the folder as-is to GitHub Pages, Netlify or Vercel.

## How the plan demos work

- Every feature in `config.js` has a `minPlan`. When you preview a plan, the features above that plan are locked and show an upgrade prompt.
- Plan limits (seats, dashboards, data sources) show as usage meters. Buttons such as *New dashboard*, *Connect* and *Invite* enforce those limits.
- You can deep-link to a plan and a screen, e.g. `demo/?plan=business#team`.
- The deck embeds `demo/?plan=<id>` for each plan, so you can click around inside the slide during the pitch.

## Deck controls

Use ← and →, Space, Home and End to move between slides, or the buttons at the bottom. `#5` in the URL opens slide 5. Printing to PDF puts one slide on each page.

## Before showing investors

Everything marked `PLACEHOLDER` in `assets/config.js` is invented sample content. Replace the product description, plans, prices, market size, traction and the ask with the real figures.
