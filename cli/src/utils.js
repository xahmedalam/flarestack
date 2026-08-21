export function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]+/g, "");
}

export function validateProjectName(name) {
  if (!name) return "Project name is required.";
  if (name.length > 214)
    return `Project name must be at most 214 characters (got ${name.length}).`;
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(name))
    return "Project name may only contain lowercase letters, numbers, hyphens, dots, and underscores, and must start with a letter or number.";
  return undefined;
}

export function titleCase(name) {
  return name
    .split(/[._-]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function detectPackageManager(userAgent) {
  if (!userAgent) return null;
  const match = /^(pnpm|npm|yarn|bun)\/(\d+\.\d+\.\d+)/.exec(userAgent);
  if (!match) return null;
  return { name: match[1], version: match[2] };
}
