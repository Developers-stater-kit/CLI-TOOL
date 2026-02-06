import chalk from "chalk";
import { select, input, checkbox } from "@inquirer/prompts";

/* ─── DESIGN TOKENS ───────────────────────────── */

export const theme = {
  space: {
    q: "   ",      // before question
    opt: "    ",   // before options
    section: "\n"
  },

  colors: {
    label: chalk.white,
    value: chalk.cyan,
    dim: chalk.gray,
    accent: chalk.hex("#60d0ff"),
    success: chalk.green,
  },

  icons: {
    done: chalk.green("✔"),
    arrow: chalk.cyan("❯"),
    dot: chalk.gray("•"),
  }
};

/* ─── CORE WRAPPERS ───────────────────────────── */

export async function uiSelect(opts: any) {
  return select({
    ...opts,

    prefix: theme.space.q,

    message: theme.colors.label(opts.message),

    choices: opts.choices.map((c: any) => ({
      ...c,
      name: theme.space.opt + c.name
    }))
  });
}

export async function uiInput(opts: any) {
  return input({
    ...opts,
    prefix: theme.space.q,
    message: theme.colors.label(opts.message)
  });
}

export async function uiCheckbox(opts: any) {
  return checkbox({
    ...opts,
    prefix: theme.space.q,
    message: theme.colors.label(opts.message),

    choices: opts.choices.map((c: any) => ({
      ...c,
      name: theme.space.opt + c.name
    }))
  });
}

/* ─── SECTION HEADER ───────────────────────────── */

export function uiSection(title: string) {
  console.log(
    theme.space.section +
    theme.colors.dim("── ") +
    theme.colors.label(title)
  );
}

/* ─── VALUE PRINTER ───────────────────────────── */

export function uiValue(label: string, value: string) {
  console.log(
    `${theme.icons.done} ${label}: ${theme.colors.value(value)}`
  );
}
