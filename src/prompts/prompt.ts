import chalk from "chalk";
import { cliState } from "../components/state";
import { input, select, checkbox } from "@inquirer/prompts";

import {
  AUTH_METHOD_CHOICES,
  AUTH_PROVIDER_CHOICES,
  AuthMethod,
  ORM_CHOICES,
  PROJECT_SCOPE_CHOICES,
  PROJECT_SETUP_CHOICES,
  PROJECT_TYPE_CHOICES,
  SOCIAL_PROVIDER_CHOICES,
  SocialProvider,
  DB_ENGINE_CHOICES,
  DB_PROVIDER_MAPPING,
  FRAMEWORK_MAPPING,
  UI_LIB_CHOICE
} from "../types/constent";

import { section, UI } from "../components/mislineous";
import { fail, startLoading } from "../components/loader";
import axios from "axios";
import { buildProject } from "../core/builder";
import path from "node:path";

/* ─────────────────────────────────────────────
   DESIGN HELPERS
────────────────────────────────────────────── */

function q(text: string) {
  return chalk.white("   " + text);   // LEFT GAP LIKE IMAGE
}

function done(text: string) {
  return `${chalk.green("✔")} ${text}`;
}

function value(v: string) {
  return chalk.cyan(v);
}

function pipe() {
  return chalk.gray("│");
}


export async function runPrompts(targetPath?: string | null) {

  /* ─── PROJECT DETAILS ─────────────────────── */
  section("Project Details");

  // ─ NAME ─
  if (targetPath) {
    cliState.projectName =
      path.basename(targetPath === "." ? process.cwd() : targetPath);

    console.log(
      `${pipe()} ${done("Project name:")} ${value(cliState.projectName)}`
    );

  } else {
    cliState.projectName = await input({
      message: q("Enter the project name:"),
      validate: (v) => {
        if (!v) return "Required";
        if (!/^[a-z0-9-]+$/.test(v)) return "Only a-z 0-9 and - allowed";
        return true;
      },
    });
  }

  // ─ SCOPE ─
  cliState.scope = await select({
    message: q("Select the scope of the project:"),
    choices: PROJECT_SCOPE_CHOICES,
  });

  console.log(`${done("Scope:")} ${value(cliState.scope!)}`);

  // ─ PLATFORM ─
  cliState.appType = await select({
    message: q("Select the target platform:"),
    choices: PROJECT_TYPE_CHOICES,
  });

  // ─ FRAMEWORK ─
  cliState.framework = await select({
    message: q("Select a development framework:"),
    choices:
      FRAMEWORK_MAPPING[
        cliState.appType as keyof typeof FRAMEWORK_MAPPING
      ],
  });

  // ─ UI LIB ─
  cliState.isShadcn = await select({
    message: q("Use ShadCN UI components?"),
    choices: UI_LIB_CHOICE,
  });

  // ─ SETUP LEVEL ─
  cliState.setupUpto = await select({
    message: q("Configuration level:"),
    choices: PROJECT_SETUP_CHOICES,
  });

  /* ─── DATABASE ────────────────────────────── */
  if (["auth", "db-orm", "payments"].includes(cliState.setupUpto!)) {

    section("Database & ORM");

    cliState.dbEngine = await select({
      message: q("Database engine:"),
      choices: DB_ENGINE_CHOICES,
    });

    cliState.dbProvider = await select({
      message: q("Database provider:"),
      choices:
        DB_PROVIDER_MAPPING[
          cliState.dbEngine as keyof typeof DB_PROVIDER_MAPPING
        ],
    });

    cliState.orm = await select({
      message: q("ORM layer:"),
      choices: ORM_CHOICES,
    });
  }

  /* ─── AUTH ────────────────────────────────── */
  if (["auth", "payments"].includes(cliState.setupUpto!)) {

    section("Authentication");

    cliState.authLib = await select({
      message: q("Auth provider:"),
      choices: AUTH_PROVIDER_CHOICES,
    });

    const authMethods = (await checkbox({
      message: q("Authentication methods:"),
      required: true,
      choices: AUTH_METHOD_CHOICES,
    })) as AuthMethod[];

    cliState.authMethods = authMethods;

    if (authMethods.includes("social")) {

      section("Social Providers");

      cliState.socialProviders = (await checkbox({
        message: q("Choose social providers:"),
        required: true,
        choices: SOCIAL_PROVIDER_CHOICES,
      })) as SocialProvider[];
    }
  }

  /* ─── CONFIRMATION ────────────────────────── */

  section("Confirmation");

  const confirm = await select({
    message: q("Proceed with this setup?"),
    choices: [
      { name: "Confirm and continue", value: "yes" },
      { name: "Review options", value: "no" },
    ],
  });

  if (confirm === "no") {
    console.log(chalk.yellow("\nRestarting...\n"));
    return runPrompts();
  }

  /* ─── BUILD PLAN ──────────────────────────── */

  startLoading("Generating Plan...");

  try {
    const response = await axios.post(
      `${process.env.API_BASE_URL || "http://localhost:6000/api"}/compose`,
      cliState
    );

    if (!response.data.success) {
      fail(response.data.message);
      process.exit(1);
    }

    await buildProject(
      response.data.project,
      cliState.projectName!
    );

  } catch (error: any) {
    fail("Failed to generate build plan");
    process.exit(1);
  }
}
