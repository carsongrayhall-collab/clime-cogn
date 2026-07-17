const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const siteOut = path.join(root, "public", "_site");

const pages = [
  ["index.html", "index.html"],
  ["checkout/index.html", "checkout/index.html"],
  ["elevate/index.html", "elevate/index.html"],
  ["faq/index.html", "faq/index.html"],
  ["legal/index.html", "legal/index.html"],
  ["philosophy/index.html", "philosophy/index.html"],
  ["privacy/index.html", "privacy/index.html"],
  ["team/index.html", "team/index.html"],
];

const copyFile = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
};

fs.rmSync(siteOut, { force: true, recursive: true });
fs.mkdirSync(siteOut, { recursive: true });

for (const [sourcePath, outputPath] of pages) {
  copyFile(path.join(root, sourcePath), path.join(siteOut, outputPath));
}

copyFile(path.join(root, "styles.css"), path.join(root, "public", "styles.css"));
copyFile(path.join(root, "favicon.png"), path.join(root, "public", "favicon.png"));

console.log("Prepared static HTML pages for Next.js routing.");
