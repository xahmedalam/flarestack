import chalk from "chalk";

const BANNER = [
  "######## ##          ###    ########  ########  ######  ########    ###     ######  ##    ##",
  "##       ##         ## ##   ##     ## ##       ##    ##    ##      ## ##   ##    ## ##   ## ",
  "##       ##        ##   ##  ##     ## ##       ##          ##     ##   ##  ##       ##  ##  ",
  "######   ##       ##     ## ########  ######    ######     ##    ##     ## ##       #####   ",
  "##       ##       ######### ##   ##   ##             ##    ##    ######### ##       ##  ##  ",
  "##       ##       ##     ## ##    ##  ##       ##    ##    ##    ##     ## ##    ## ##   ## ",
  "##       ######## ##     ## ##     ## ########  ######     ##    ##     ##  ######  ##    ##",
];

const GRADIENT = ["#ff6b6b", "#ffa94d", "#ffd43b", "#69db7c", "#4dabf7"];

export function printBanner() {
  console.log();
  BANNER.forEach((line, index) => {
    console.log(chalk.hex(GRADIENT[index % GRADIENT.length])(line));
  });
  console.log(chalk.dim("  Next.js 16 · Hono · Cloudflare Workers"));
  console.log();
}
