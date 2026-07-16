const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist");
const vercelOutDir = path.join(root, ".vercel", "output");
const vercelStaticDir = path.join(vercelOutDir, "static");

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
fs.rmSync(vercelOutDir, { force: true, recursive: true });
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(vercelStaticDir, { recursive: true });

for (const entry of entries) {
  const source = path.join(root, entry);
  if (!fs.existsSync(source)) continue;

  const copyOptions = {
    recursive: true,
    filter: (filePath) => {
      const relativePath = path.relative(root, filePath).replace(/\\/g, "/");
      return !relativePath.startsWith("privacy/sc1080_midterm_study_guide");
    },
  };

  fs.cpSync(source, path.join(outDir, entry), copyOptions);
  fs.cpSync(source, path.join(vercelStaticDir, entry), copyOptions);
}

fs.writeFileSync(
  path.join(vercelOutDir, "config.json"),
  `${JSON.stringify({ version: 3 }, null, 2)}\n`,
);

console.log(`Built Clime static site to ${path.relative(root, outDir)}`);
console.log(`Built Vercel static output to ${path.relative(root, vercelStaticDir)}`);
