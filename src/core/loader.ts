import ora, { Ora } from "ora";

let spinner: Ora | null = null;

export function startLoading(text: string) {
  spinner = ora(text).start();
}

export function succeed(text: string) {
  spinner?.succeed(text);
  spinner = null;
}

export function fail(text: string) {
  spinner?.fail(text);
  spinner = null;
}
