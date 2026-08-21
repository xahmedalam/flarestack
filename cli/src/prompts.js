import * as p from "@clack/prompts";
import { slugify, validateProjectName } from "./utils.js";

function cancel() {
  p.cancel("Operation cancelled.");
  process.exit(0);
}

export async function promptProjectName(defaultName) {
  const value = await p.text({
    message: "Project name",
    placeholder: defaultName,
    validate: (input) => validateProjectName(slugify(input)) || undefined,
  });
  if (p.isCancel(value)) return cancel();
  return value;
}

export async function promptPackageManager(detectedName) {
  const value = await p.select({
    message: "Package manager",
    initialValue: detectedName,
    options: [
      { value: "npm", label: "npm" },
      { value: "pnpm", label: "pnpm" },
      { value: "bun", label: "bun" },
      { value: "yarn", label: "yarn" },
    ],
  });
  if (p.isCancel(value)) return cancel();
  return value;
}

export async function promptYesNo(message, initialValue) {
  const value = await p.confirm({ message, initialValue });
  if (p.isCancel(value)) return cancel();
  return value;
}
