import app from "../server/index.mjs";

function queryValue(value) {
  if (Array.isArray(value)) return value.join("/");
  return typeof value === "string" ? value : "";
}

function encodePathPart(value) {
  return encodeURIComponent(queryValue(value));
}

function encodePath(value) {
  return queryValue(value).split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

function normalizeApiUrl(req, explicitPath) {
  const parsed = new URL(req.url || "/", "http://localhost");

  if (explicitPath) {
    req.url = `${explicitPath(req.query || {})}${parsed.search}`;
    return;
  }

  if (parsed.pathname === "/api" || parsed.pathname.startsWith("/api/")) {
    req.url = `${parsed.pathname}${parsed.search}`;
    return;
  }

  const catchAllPath = queryValue(req.query?.path) || queryValue(req.query?.["...path"]);
  const path = catchAllPath || parsed.pathname.replace(/^\/+/, "");

  parsed.searchParams.delete("path");
  parsed.searchParams.delete("...path");
  const query = parsed.searchParams.toString();
  req.url = `/api/${path}${query ? `?${query}` : ""}`;
}

export function createHandler(explicitPath) {
  return function handler(req, res) {
    normalizeApiUrl(req, explicitPath);
    return app(req, res);
  };
}

export { encodePath, encodePathPart, queryValue };

export default createHandler();
