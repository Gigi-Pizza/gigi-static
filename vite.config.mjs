import fs from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { manifest } from "@gigi/runtime-manifest";
import { includeRuntimeImportMap } from "@rmc-toolkit/vite";

// Placeholder origins that appear in source files (index.html, llms.txt). They
// are rewritten at build time to the real deploy origins so preview builds can
// point at preview infrastructure. Gigi currently self-hosts its assets with
// root-absolute paths (/css, /images), so these replacements are typically a
// no-op today — kept for parity with the web-static pattern and future use.
const defaultSiteOrigin = "https://gigipizza.ca";
const defaultAssetsOrigin = "https://assets.gigipizza.ca";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceOrigins(content, { siteOrigin, assetsOrigin }) {
  return [
    [defaultSiteOrigin, siteOrigin],
    [defaultAssetsOrigin, assetsOrigin],
  ].reduce(
    (current, [searchValue, replaceValue]) =>
      current.replace(new RegExp(escapeRegExp(searchValue), "g"), replaceValue),
    content,
  );
}

// Copies the static source tree (css, images, menu.html, favicon, …) verbatim
// into the output dir. index.html is skipped here because Vite's HTML pipeline
// emits it (with the injected import map); llms.txt, if present, gets origin
// replacement; everything else is copied as-is.
function copySourceTree({ siteOrigin, assetsOrigin }) {
  let resolvedConfig;

  function copyRecursive(sourceDir, outputDir, relativeDir = "") {
    const sourcePath = path.join(sourceDir, relativeDir);
    fs.mkdirSync(path.join(outputDir, relativeDir), { recursive: true });

    for (const entry of fs.readdirSync(sourcePath, { withFileTypes: true })) {
      const entryRelativePath = path.join(relativeDir, entry.name);
      const entrySourcePath = path.join(sourceDir, entryRelativePath);
      const entryOutputPath = path.join(outputDir, entryRelativePath);

      if (entry.isDirectory()) {
        copyRecursive(sourceDir, outputDir, entryRelativePath);
        continue;
      }

      if (entryRelativePath === "index.html") {
        continue;
      }

      if (entryRelativePath === "llms.txt") {
        const content = fs.readFileSync(entrySourcePath, "utf8");
        fs.mkdirSync(path.dirname(entryOutputPath), { recursive: true });
        fs.writeFileSync(
          entryOutputPath,
          replaceOrigins(content, { siteOrigin, assetsOrigin }),
          "utf8",
        );
        continue;
      }

      fs.mkdirSync(path.dirname(entryOutputPath), { recursive: true });
      fs.copyFileSync(entrySourcePath, entryOutputPath);
    }
  }

  return {
    name: "gigi-static-copy-source-tree",
    apply: "build",
    configResolved(config) {
      resolvedConfig = config;
    },
    // Origin replacement on the HTML. Runs before includeRuntimeImportMap's
    // injection (plugin order below), so the inlined import map's URLs come
    // solely from the manifest, never from replaceOrigins.
    transformIndexHtml(html) {
      return replaceOrigins(html, { siteOrigin, assetsOrigin });
    },
    closeBundle() {
      const sourceDir = resolvedConfig.root;
      const outputDir = path.resolve(
        resolvedConfig.root,
        resolvedConfig.build.outDir,
      );
      copyRecursive(sourceDir, outputDir);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteOrigin = env.GIGI_SITE_ORIGIN || defaultSiteOrigin;
  const assetsOrigin = env.GIGI_ASSETS_ORIGIN || defaultAssetsOrigin;
  // Cloudflare Pages injects CF_PAGES_BRANCH; main => production, all others =>
  // preview. Selects which manifest environment feeds the import map.
  const environment = env.CF_PAGES_BRANCH === "main" ? "production" : "preview";

  return {
    root: path.resolve("src"),
    publicDir: false,
    build: {
      outDir: path.resolve("dist"),
      emptyOutDir: true,
    },
    // Order matters: copySourceTree (replaceOrigins) first, then the import-map
    // injection, so the map's URLs are produced solely by the manifest.
    plugins: [
      copySourceTree({ siteOrigin, assetsOrigin }),
      includeRuntimeImportMap({ manifest, environment }),
    ],
  };
});
