import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const publicDir = path.resolve("public");
const sourceFile = path.resolve("node_modules/@vercel/speed-insights/dist/index.mjs");
const targetFile = path.join(publicDir, "speed-insights.mjs");

// Ensure public directory exists
await mkdir(publicDir, { recursive: true });

// Copy the Speed Insights module to public folder
await copyFile(sourceFile, targetFile);

console.log("✓ Copied Speed Insights module to public/speed-insights.mjs");
