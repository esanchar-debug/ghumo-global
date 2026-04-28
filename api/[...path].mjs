import app from "../server/index.mjs";

function queryValue(value) {
  if (Array.isArray(value)) return value.join("/");
  return typeof value === "string" ? value : "";
}

function normalizeApiUrl(req) {
  const currentUrl = req.url || "/";
  if (currentUrl === "/api" || currentUrl.startsWith("/api/")) return;

  const parsed = new URL(currentUrl, "http://localhost");
  const catchAllPath = queryValue(req.query?.path) || queryValue(req.query?.["...path"]);
  const path = catchAllPath || parsed.pathname.replace(/^\/+/, "");

  parsed.searchParams.delete("path");
  parsed.searchParams.delete("...path");
  const query = parsed.searchParams.toString();
  req.url = `/api/${path}${query ? `?${query}` : ""}`;
}

export default async function handler(req, res) {
  normalizeApiUrl(req);
  return app(req, res);
}
