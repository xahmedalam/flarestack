import chalk from "chalk";
import { execa } from "execa";

export async function initGit(dir) {
  try {
    await execa("git", ["init", "-b", "main"], { cwd: dir, stdio: "inherit" });
  } catch {
    console.warn(
      chalk.yellow(
        "! Could not initialize a git repository. Run `git init` manually.",
      ),
    );
  }
}

export async function installDeps(dir, pmName) {
  try {
    await execa(pmName, ["install"], { cwd: dir, stdio: "inherit" });
  } catch {
    console.warn(
      chalk.yellow(
        `! Dependency installation failed. Run \`${pmName} install\` manually.`,
      ),
    );
  }
}
