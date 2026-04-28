import { access, readdir, stat } from "node:fs/promises";
import path from "node:path";

const publicDir = path.resolve("public");
const requiredFiles = [
  "index.html",
  "favicon.svg",
  "assets/index-a834ecb4.js",
  "assets/index-D5d-6ujy.css"
];

await Promise.all(requiredFiles.map((file) => access(path.join(publicDir, file))));

const assetEntries = await readdir(path.join(publicDir, "assets"));
if (!assetEntries.some((file) => file.endsWith(".js"))) {
  throw new Error("public/assets must contain a JavaScript bundle.");
}
if (!assetEntries.some((file) => file.endsWith(".css"))) {
  throw new Error("public/assets must contain a CSS bundle.");
}

const { size } = await stat(path.join(publicDir, "index.html"));
if (size === 0) {
  throw new Error("public/index.html is empty.");
}

console.log("Static output verified in public/.");
