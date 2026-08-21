import {
  cp,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import * as tar from "tar";

const DEFAULT_TEMPLATE_URL =
  "https://github.com/xahmedalam/flarestack/archive/refs/heads/main.tar.gz";

const EXCLUDED = new Set([
  ".git",
  "cli",
  "node_modules",
  ".next",
  ".open-next",
  "AGENTS.md",
  "CLAUDE.md",
  "tsconfig.tsbuildinfo",
  ".github/workflows/publish.yml",
]);

function isExcluded(relPath, pmName) {
  if (EXCLUDED.has(relPath)) return true;
  if (relPath.startsWith("cli/")) return true;
  if (relPath === "pnpm-lock.yaml" && pmName !== "pnpm") return true;
  return false;
}

export async function getTemplateSource(source) {
  if (!source) source = DEFAULT_TEMPLATE_URL;

  if (source.startsWith("http://") || source.startsWith("https://")) {
    const tmp = await mkdtemp(join(tmpdir(), "flarestack-"));
    try {
      const tarball = join(tmp, "template.tar.gz");
      const res = await fetch(source);
      if (!res.ok)
        throw new Error(
          `Failed to download template (${res.status} ${res.statusText}).`,
        );
      await writeFile(tarball, Buffer.from(await res.arrayBuffer()));
      await tar.x({ file: tarball, cwd: tmp });
      const entries = await readdir(tmp);
      const root = entries.find((entry) => entry !== "template.tar.gz");
      if (!root) throw new Error("Template archive contained no files.");
      return {
        dir: join(tmp, root),
        cleanup: () => rm(tmp, { recursive: true, force: true }),
      };
    } catch (err) {
      await rm(tmp, { recursive: true, force: true });
      throw err;
    }
  }

  const dir = resolve(source);
  if (!existsSync(dir)) throw new Error(`Template path not found: ${source}`);
  return { dir, cleanup: () => {} };
}

export async function copyTemplate(src, dest, pmName) {
  await cp(src, dest, {
    recursive: true,
    filter: (from) => {
      const rel = relative(src, from);
      if (!rel) return true;
      return !isExcluded(rel, pmName);
    },
  });
}

function rewriteDeployWorkflow(content, pmName) {
  if (pmName === "pnpm") return content;

  content = content.replaceAll("      - uses: pnpm/action-setup@v4\n\n", "");

  if (pmName === "bun") {
    content = content.replaceAll(
      "      - uses: actions/setup-node@v4\n        with:\n          node-version: 24\n          cache: pnpm\n",
      "      - uses: oven-sh/setup-bun@v2\n",
    );
  } else {
    content = content.replaceAll(
      "          cache: pnpm",
      `          cache: ${pmName === "npm" ? "npm" : "yarn"}`,
    );
  }

  content = content.replaceAll(
    "run: pnpm install --frozen-lockfile",
    `run: ${pmName} install`,
  );
  content = content.replaceAll(
    "pnpm exec wrangler",
    pmName === "npm"
      ? "npx wrangler"
      : pmName === "yarn"
        ? "yarn wrangler"
        : "bunx wrangler",
  );
  content = content.replaceAll(
    "pnpm run deploy",
    pmName === "npm"
      ? "npm run deploy"
      : pmName === "yarn"
        ? "yarn deploy"
        : "bun run deploy",
  );
  return content;
}

export async function rewritePlaceholders(dir, { slug, displayName, pm }) {
  const workerName = slug.replace(/[._]/g, "-");

  const pkgPath = join(dir, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  pkg.name = slug;
  if (pm.version) pkg.packageManager = `${pm.name}@${pm.version}`;
  else delete pkg.packageManager;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  const wranglerPath = join(dir, "wrangler.jsonc");
  let wrangler = await readFile(wranglerPath, "utf8");
  wrangler = wrangler.replace(
    /("name"\s*:\s*")flarestack(")/,
    `$1${workerName}$2`,
  );
  await writeFile(wranglerPath, wrangler);

  const layoutPath = join(dir, "app/layout.tsx");
  let layout = await readFile(layoutPath, "utf8");
  layout = layout.replace('title: "Flarestack",', `title: "${displayName}",`);
  await writeFile(layoutPath, layout);

  const pagePath = join(dir, "app/page.tsx");
  let page = await readFile(pagePath, "utf8");
  page = page.replace("<h1>Flarestack</h1>", `<h1>${displayName}</h1>`);
  page = page.replace(/^\s*<h2>---PR TEST 2---<\/h2>\s*$/m, "");
  await writeFile(pagePath, page);

  const workflowPath = join(dir, ".github/workflows/deploy.yml");
  let workflow = await readFile(workflowPath, "utf8");
  workflow = rewriteDeployWorkflow(workflow, pm.name);
  await writeFile(workflowPath, workflow);
}
