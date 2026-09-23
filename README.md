# Visiro: investor pitch and demo

A one-page web app with three sections:

- **Overview** (`#home`): the pitch summary, with a card for each plan.
- **Live demo** (`#demo`): a clickable product demo. Switch between Free, Pro, Business and Enterprise and the features and limits change to match.
- **Pitch deck** (`#deck`): slides in the browser, with a live demo for each plan built into its slide.

There is no build step for the site itself and no dependencies.

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `assets/app.js` | Home, demo and deck logic |
| `assets/app.css` | Styles (light and dark theme) |
| `assets/config.js` | **The one file to edit:** product copy, plans, prices, features and pitch numbers |
| `scripts/build-single.js` | Optional: packs everything into one self-contained file, `dist/visiro.html` |

## Run it

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

To put it online, upload the repo folder as-is to any static host, such as GitHub Pages, Netlify or Vercel.

## Links

Every screen has its own address, so you can send someone straight to it:

- `#demo-pro`: the demo on the Pro plan
- `#demo-business-team`: the Team screen on the Business plan
- `#demo-free-compare`: the plan comparison table
- `#deck-6`: slide 6 of the deck

## Before showing investors

Everything marked `PLACEHOLDER` in `assets/config.js` is invented sample content. Replace the product description, plans, prices, market size, traction and the ask with the real figures.
