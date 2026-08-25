#!/usr/bin/env node
/**
 * GitHub Pages SPA fallback (https://github.com/rafgraph/spa-github-pages)
 * Project site base: /doublemarksite/
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const indexPath = join(distDir, "index.html");
const basePath = process.env.VITE_BASE_PATH ?? "/";
const segmentCount = basePath.replace(/^\/|\/$/g, "") ? 1 : 0;

const routeRestoreScript = `<script type="text/javascript">
(function(l){if(l.search[1]==="/"){var decoded=l.search.slice(1).split("&").map(function(s){return s.replace(/~and~/g,"&")}).join("?");window.history.replaceState(null,null,l.pathname.slice(0,-1)+decoded+l.hash)}})(window.location);
</script>`;

const redirectScript = `<script type="text/javascript">
var segmentCount=${segmentCount};
var l=window.location;
l.replace(l.protocol+"//"+l.hostname+(l.port?":"+l.port:"")+l.pathname.split("/").slice(0,1+segmentCount).join("/")+"/?/"+l.pathname.slice(1).split("/").slice(segmentCount).join("/").replace(/&/g,"~and~")+(l.search?"&"+l.search.slice(1).replace(/&/g,"~and~"):"")+l.hash);
</script>`;

if (!existsSync(indexPath)) {
  console.error("dist/index.html not found — run vite build first");
  process.exit(1);
}

let indexHtml = readFileSync(indexPath, "utf8");
if (!indexHtml.includes("l.search[1]===\"/\"")) {
  indexHtml = indexHtml.replace("<body>", `<body>\n${routeRestoreScript}`);
  writeFileSync(indexPath, indexHtml, "utf8");
}

const notFoundHtml = `<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>DoubleMark</title>
${redirectScript}
</head>
<body></body>
</html>
`;
writeFileSync(join(distDir, "404.html"), notFoundHtml, "utf8");
writeFileSync(join(distDir, ".nojekyll"), "", "utf8");
console.log(`SPA 404.html ready (segmentCount=${segmentCount}, base=${basePath})`);
