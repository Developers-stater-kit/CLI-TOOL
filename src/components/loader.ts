import ora, { Ora } from "ora";
import chalk from "chalk";

let spinner: Ora | null = null;

// Image-inspired symbols
const ICONS = {
  done: chalk.gray("◇"),        // soft diamond like image
  fail: chalk.gray("◆"),        // filled diamond
  step: chalk.gray("│"),        // pipe connector
  arrow: chalk.gray("→"),
  dot: chalk.gray("•"),
};

export function startLoading(text: string) {
  if (spinner) spinner.stop();

  spinner = ora({
    text: chalk.white(text),
    spinner: "dots",
  }).start();
}

export function succeed(text: string) {
  if (spinner) {
    spinner.succeed(chalk.white(text));
    spinner = null;
  } else {
    console.log(`${ICONS.done} ${chalk.white(text)}`);
  }
}

export function fail(text: string) {
  if (spinner) {
    spinner.fail(chalk.gray(text));
    spinner = null;
  } else {
    console.log(`${ICONS.fail} ${chalk.gray(text)}`);
  }
}

// Tree style step
export function step(text: string) {
  console.log(`${ICONS.step} ${chalk.gray(text)}`);
}

// Bullet info
export function info(text: string) {
  console.log(`${ICONS.dot} ${chalk.gray(text)}`);
}

// Section divider like image
export function divider(title?: string) {
  if (title) {
    console.log(
      chalk.gray(`\n── ${title} `) +
      chalk.gray("─".repeat(40 - title.length))
    );
  } else {
    console.log(chalk.gray("─".repeat(40)));
  }
}
