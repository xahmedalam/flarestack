#!/usr/bin/env node
import { Command } from "commander";
import { existsSync } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
import { basename, relative, resolve } from "node:path";
import chalk from "chalk";
import { printBanner } from "./banner.js";
import {
  detectPackageManager,
  slugify,
  titleCase,
  validateProjectName,
} from "./utils.js";
import {
  promptPackageManager,
  promptProjectName,
  promptYesNo,
} from "./prompts.js";
import {
  copyTemplate,
  getTemplateSource,
  rewritePlaceholders,
} from "./template.js";
import { initGit, installDeps } from "./setup.js";

const VALID_PMS = ["npm", "pnpm", "bun", "yarn"];

const program = new Command();
program
  .name("create-flarestack")
  .description(
    "Scaffold a FlareStack app — Next.js + Hono + Cloudflare Workers",
  )
  .argument(
    "[project]",
    "project name, or '.' to scaffold into the current directory",
  )
  .option(
    "--name <name>",
    "project name (alternative to the positional argument)",
  )
  .option("--pm <manager>", "package manager to use (npm, pnpm, bun, or yarn)")
  .option("--no-git", "skip initializing a git repository")
  .option("--no-install", "skip installing dependencies")
  .option(
    "--template <path-or-url>",
    "override the template source (defaults to the flarestack GitHub repository)",
  )
  .allowExcessArguments(false)
  .parse(process.argv);

const opts = program.opts();
const positional = program.args[0];
const interactive = Boolean(process.stdout.isTTY);

if (positional && opts.name) {
  console.error(
    chalk.red(
      "✖ Provide either a positional project name or --name, not both.",
    ),
  );
  process.exit(1);
}

async function main() {
  printBanner();

  let rawName;
  if (positional === ".") rawName = basename(process.cwd());
  else if (positional) rawName = positional;
  else if (opts.name) rawName = opts.name;
  else if (interactive) rawName = await promptProjectName("flarestack-app");
  else {
    console.error(
      chalk.red("✖ No project name given. Pass one: create-flarestack my-app"),
    );
    process.exit(1);
  }

  const slug = slugify(rawName);
  const invalid = validateProjectName(slug);
  if (invalid) {
    console.error(chalk.red(`✖ ${invalid}`));
    process.exit(1);
  }

  const targetDir = positional === "." ? process.cwd() : resolve(slug);
  if (existsSync(targetDir) && (await readdir(targetDir)).length > 0) {
    console.error(chalk.red(`✖ Directory ${targetDir} is not empty.`));
    process.exit(1);
  }

  let pm = null;
  if (opts.pm) {
    if (!VALID_PMS.includes(opts.pm)) {
      console.error(
        chalk.red(
          `✖ Unknown package manager "${opts.pm}". Use one of: ${VALID_PMS.join(", ")}`,
        ),
      );
      process.exit(1);
    }
    pm = { name: opts.pm, version: null };
  } else {
    pm = detectPackageManager(process.env.npm_config_user_agent);
    if (pm && interactive)
      console.log(chalk.dim(`Detected package manager: ${pm.name}`));
  }
  if (!pm) {
    if (!interactive) {
      console.error(
        chalk.red("✖ Could not detect a package manager. Pass one with --pm."),
      );
      process.exit(1);
    }
    pm = { name: await promptPackageManager(null), version: null };
  }

  let git = opts.git !== false;
  let install = opts.install !== false;
  if (interactive) {
    if (git) git = await promptYesNo("Initialize a git repository?", true);
    if (install) install = await promptYesNo("Install dependencies?", true);
  }

  console.log(chalk.dim(`\nScaffolding ${slug} in ${targetDir}...`));
  await mkdir(targetDir, { recursive: true });

  let cleanup = () => {};
  try {
    const source = await getTemplateSource(opts.template);
    cleanup = source.cleanup;
    await copyTemplate(source.dir, targetDir, pm.name);
    await rewritePlaceholders(targetDir, {
      slug,
      displayName: titleCase(slug),
      pm,
    });
  } catch (err) {
    console.error(chalk.red(`✖ Failed to scaffold template: ${err.message}`));
    process.exit(1);
  } finally {
    await cleanup();
  }

  if (git) await initGit(targetDir);
  if (install) await installDeps(targetDir, pm.name);

  const rel = relative(process.cwd(), targetDir) || ".";
  console.log();
  console.log(chalk.green("✔ FlareStack app created!"));
  console.log();
  console.log(chalk.dim(`  cd ${rel}`));
  if (!install) console.log(chalk.dim(`  ${pm.name} install`));
  console.log(chalk.dim(`  ${pm.name} dev`));
  console.log();
  console.log(chalk.dim("  Deploy to Cloudflare (OpenNext):"));
  console.log(chalk.dim(`  ${pm.name} run preview`));
  console.log(chalk.dim(`  ${pm.name} run deploy`));
  console.log();
}

main().catch((err) => {
  console.error(chalk.red(`✖ Unexpected error: ${err}`));
  process.exit(1);
});
