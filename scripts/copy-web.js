/* ينسخ ملفات لعبة الويب إلى مجلد www/ الذي يستخدمه Capacitor.
   نُبقي الملفات في الجذر كي يظل GitHub Pages يعمل، وننسخها إلى www/ للتطبيق. */
const fs = require("fs");
const path = require("path");

const FILES = ["index.html", "game.js", "mobile-ads.js", "sw.js", "manifest.json", "icon.svg"];
const root = path.join(__dirname, "..");
const www = path.join(root, "www");

fs.mkdirSync(www, { recursive: true });
for (const f of FILES) {
  const src = path.join(root, f);
  if (!fs.existsSync(src)) { console.warn("skip (missing): " + f); continue; }
  fs.copyFileSync(src, path.join(www, f));
}
console.log("✓ Copied " + FILES.length + " web files to www/");
