import ora, { Ora } from "ora";

let spinner: Ora | null = null;

export function startLoading(text: string) {
  // If a spinner is already running, stop it first to prevent log clutter
  if (spinner) {
    spinner.stop();
  }
  spinner = ora(text).start();
}

export function succeed(text: string) {
  if (spinner) {
    spinner.succeed(text);
    spinner = null; // Clear the instance
  } else {
    console.log(`✔ ${text}`); // Fallback if no spinner is active
  }
}

export function fail(text: string) {
  if (spinner) {
    spinner.fail(text);
    spinner = null; // Clear the instance
  } else {
    console.error(`✖ ${text}`); // Fallback if no spinner is active
  }
}