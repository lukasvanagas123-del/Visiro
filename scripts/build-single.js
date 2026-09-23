// Inlines index.html's CSS and JS into one self-contained page fragment: dist/visiro.html
// Usage: node scripts/build-single.js
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

let html = read("index.html")
  .replace('<link rel="stylesheet" href="assets/app.css">', () => `<style>\n${read("assets/app.css")}</style>`)
  .replace('<script src="assets/config.js"></script>', () => `<script>\n${read("assets/config.js")}</script>`)
  .replace('<script src="assets/app.js"></script>', () => `<script>\n${read("assets/app.js")}</script>`);

// Drop the document wrapper (doctype, html/head/body, charset/viewport meta) so the
// output is a bare page fragment, which is what the hosted Artifact expects.
html = html
  .replace(/<!doctype html>|<\/?html[^>]*>|<\/?head>|<\/?body>|<meta charset[^>]*>|<meta name="viewport"[^>]*>/gi, "")
  .replace(/^\s*\n/gm, "");

fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist/visiro.html"), html);
console.log("Wrote dist/visiro.html");
