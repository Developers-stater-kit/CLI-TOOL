import chalk from "chalk";
import { cliState } from "../components/state";
import path from "node:path";
import axios from "axios";

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
  UI_LIB_CHOICE,
  ScopeType,
  AppType,
  SetupUpto
} from "../types/constent";

import {
  uiInput,
  uiSelect,
  uiCheckbox,
  uiLoader,
  uiSuccess,
  uiFail,
  uiStep,
} from "../components/ui/ui-tools";

import { buildProject } from "../core/builder";
import { THEME } from "../components/ui/theme";
import { uiConfirm, uiDivider, uiLine, uiSummary } from "../components/ui/base-tools";

export async function runPrompts(targetPath?: string | null) {

  /* ─────────────────────────────────────────
     PROJECT DETAILS
     ───────────────────────────────────────── */

  uiDivider("Project Details");

  // ─ PROJECT NAME ─
  if (targetPath) {
    cliState.projectName = path.basename(
      targetPath === "." ? process.cwd() : targetPath
    );
    uiLine("Project name", cliState.projectName, {
      icon: THEME.icons.done,
      indent: 1
    });
  } else {
    cliState.projectName = await uiInput({
      message: "Enter the project name:",
      validate: (v: string) => {
        if (!v) return "Required";
        if (!/^[a-z0-9-]+$/.test(v))
          return "Only a-z 0-9 and - allowed";
        return true;
      },
    });
  }

  // ─ SCOPE ─
  cliState.scope = (await uiSelect({
    message: "Select the scope of the project:",
    choices: PROJECT_SCOPE_CHOICES,
  })) as ScopeType;

  // ─ PLATFORM ─
  cliState.appType = (await uiSelect({
    message: "Select the target platform:",
    choices: PROJECT_TYPE_CHOICES,
  })) as AppType;

  // ─ FRAMEWORK ─
  cliState.framework = (await uiSelect({
    message: "Select a development framework:",
    choices:
      FRAMEWORK_MAPPING[cliState.appType as keyof typeof FRAMEWORK_MAPPING],
  })) as string;

  // ─ UI LIBRARY ─
  cliState.isShadcn = (await uiSelect({
    message: "Use ShadCN UI components?",
    choices: UI_LIB_CHOICE,
  })) as boolean;

  // ─ SETUP LEVEL ─
  cliState.setupUpto = (await uiSelect({
    message: "Configuration level:",
    choices: PROJECT_SETUP_CHOICES,
  })) as SetupUpto;

  /* ─────────────────────────────────────────
     DATABASE & ORM (Conditional)
     ───────────────────────────────────────── */

  if (["auth", "db-orm", "payments"].includes(cliState.setupUpto!)) {
    uiDivider("Database & ORM");

    cliState.dbEngine = (await uiSelect({
      message: "Database engine:",
      choices: DB_ENGINE_CHOICES,
    })) as string;

    cliState.dbProvider = (await uiSelect({
      message: "Database provider:",
      choices:
        DB_PROVIDER_MAPPING[
        cliState.dbEngine as keyof typeof DB_PROVIDER_MAPPING
        ],
    })) as string;

    cliState.orm = (await uiSelect({
      message: "ORM layer:",
      choices: ORM_CHOICES,
    })) as string;
  }

  /* ─────────────────────────────────────────
     AUTHENTICATION (Conditional)
     ───────────────────────────────────────── */

  if (["auth", "payments"].includes(cliState.setupUpto!)) {
    uiDivider("Authentication");

    cliState.authLib = (await uiSelect({
      message: "Auth provider:",
      choices: AUTH_PROVIDER_CHOICES,
    })) as string;

    const authMethods = (await uiCheckbox({
      message: "Authentication methods:",
      required: true,
      choices: AUTH_METHOD_CHOICES,
    })) as AuthMethod[];

    cliState.authMethods = authMethods;



    // ─ SOCIAL PROVIDERS (Sub-conditional) ─
    if (authMethods.includes("social")) {
      uiDivider("Social Providers");

      cliState.socialProviders = (await uiCheckbox({
        message: "Choose social providers:",
        required: true,
        choices: SOCIAL_PROVIDER_CHOICES,
      })) as SocialProvider[];


    }
  }

  /* ─────────────────────────────────────────
     CONFIRMATION & SUMMARY
     ───────────────────────────────────────── */

  uiDivider("Review Configuration");

  const summaryItems = [
    { label: "Project", value: cliState.projectName! },
    { label: "Scope", value: cliState.scope! },
    { label: "Platform", value: cliState.appType! },
    { label: "Framework", value: cliState.framework! },
    { label: "Use Shadcn", value: cliState.isShadcn ? "Yes" : "No" },
    { label: "Set Upto", value: cliState.setupUpto! },
  ];

  if (cliState.dbEngine)
    summaryItems.push({ label: "Db Engine", value: cliState.dbEngine });
  if (cliState.dbProvider)
    summaryItems.push({ label: "Db Provider", value: cliState.dbProvider });
  if (cliState.orm)
    summaryItems.push({ label: "ORM", value: cliState.orm });
  if (cliState.authLib)
    summaryItems.push({ label: "Authentication", value: cliState.authLib });
  if (cliState.socialProviders && cliState.socialProviders.length > 0)
    summaryItems.push({ label: "Auth(Social Provider)", value: cliState.socialProviders.join(", ") });

  uiSummary(summaryItems);

  console.log("");

  const confirm = await uiConfirm("Proceed with this setup?");

  if (!confirm) {
    console.log(chalk.yellow("\n↻ Restarting setup...\n"));
    return runPrompts(targetPath);
  }

  uiLoader("Generating plan...");

  try {
    const SERVICE_URL = "https://devkit-service.onrender.com";
        
    const response = await axios.post(
      `${SERVICE_URL!}/api/compose`,
      cliState
    );

    if (!response.data.success) {
      uiFail(response.data.message);
      process.exit(1);
    }

    // console.log(JSON.stringify(response.data.plan, null, 2))
    await buildProject(response.data.plan, cliState.projectName!);

    console.log("");
    uiDivider();
  } catch (error: any) {
    uiFail("Failed to generate build plan");
    process.exit(1);
  }
}