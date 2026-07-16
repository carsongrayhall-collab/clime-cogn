const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist");

const entries = [
  "index.html",
  "styles.css",
  "favicon.png",
  "checkout",
  "elevate",
  "faq",
  "legal",
  "philosophy",
  "privacy",
  "public",
  "team",
];

fs.rmSync(outDir, { force: true, recursive: true });
fs.mkdirSync(outDir, { recursive: true });

for (const entry of entries) {
  const source = path.join(root, entry);
  if (!fs.existsSync(source)) continue;

  fs.cpSync(source, path.join(outDir, entry), {
    recursive: true,
    filter: (filePath) => {
      const relativePath = path.relative(root, filePath).replace(/\\/g, "/");
      return !relativePath.startsWith("privacy/sc1080_midterm_study_guide");
    },
  });
}

console.log(`Built Clime static site to ${path.relative(root, outDir)}`);
