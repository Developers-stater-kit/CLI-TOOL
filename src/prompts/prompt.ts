import chalk from "chalk";
import { cliState } from "../components/state";
import { input, select, checkbox } from "@inquirer/prompts";
import {
    AUTH_METHOD_CHOICES,
    AUTH_PROVIDER_CHOICES,
    AuthMethod, DB_STRATEGY_CHOICES,
    ORM_CHOICES, PROJECT_SCOPE_CHOICES,
    PROJECT_SETUP_CHOICES,
    PROJECT_TYPE_CHOICES,
    SOCIAL_PROVIDER_CHOICES,
    SocialProvider,
    PAYMENT_PROVIDER_CHOICES,
    getFrameworkChoices,
    CliState
} from "../types/constent";
import { section, showSummary } from "../components/mislineous";
import { fail, startLoading, succeed } from "../components/loader";
import axios from "axios";
import { parseBuildPlan } from "../core/parser";
import { SetupTemplates } from "../core/builder";



export async function runPrompts() {
    // ---------- PROJECT ----------
    section("Project Details");

    cliState.projectName = await input({
        message: "Enter the project name:",
        validate: (v) => {
            if (!v) return "Project name is required";
            if (!/^[a-z0-9-]+$/.test(v)) return "Only lowercase letters, numbers, and hyphens (-) allowed";
            return true;
        },

    });

    cliState.scope = await select({
        message: "Select the scope of the project:",
        choices: PROJECT_SCOPE_CHOICES,

    });

    cliState.appType = await select({
        message: "Select the target platform for this project:",
        choices: PROJECT_TYPE_CHOICES,

    });

    cliState.framework = await select({
        message: "Select a development framework:",
        choices: getFrameworkChoices(cliState.appType)
    });

    cliState.setupUpto = await select({
        message: "Specify the desired configuration level:",
        choices: PROJECT_SETUP_CHOICES,
    });


    // ---------- DATABASE ----------
    if (["auth", "database", "payments"].includes(cliState.setupUpto)) {
        section("Database & ORM");

        cliState.dbType = await select({
            message: "Select data persistence strategy:",
            choices: DB_STRATEGY_CHOICES,
        });


        cliState.orm = await select({
            message: "Specify the database abstraction layer:",
            choices: ORM_CHOICES,
        });
    };

    // ---------- AUTH ----------
    if (["database", "payments"].includes(cliState.setupUpto)) {
        section("Authentication Setup");

        cliState.authLib = await select({
            message: "Specify your preferred authentication provider:",
            choices: AUTH_PROVIDER_CHOICES,
        });

        const authMethods = (await checkbox({
            message: "Choose primary authentication providers:",
            required: true,
            choices: AUTH_METHOD_CHOICES,

        })) as AuthMethod[];

        cliState.authMethods = authMethods;

        if (authMethods.includes("social")) {
            section("Social Providers");

            cliState.socialProviders = (await checkbox({
                message: "Choose integrated social providers:",
                required: true,
                choices: SOCIAL_PROVIDER_CHOICES,
            })) as SocialProvider[];
        }
    }

    // ---------- PAYMENTS ----------
    // if (cliState.setupUpto === "payments") {
    //     section("Payments");

    //     cliState.paymentProvider = await select({
    //         message: "Select the payment provider:",
    //         choices: PAYMENT_PROVIDER_CHOICES,
    //     });
    // }

    console.log("\n\n");
    showSummary(cliState);
    console.log("\n\n");

    // ---------- CONFIRMATION ----------
    const confirm = await select({
        message: "Do you want to proceed with this setup?",
        choices: [
            { name: "✅ Confirm and continue", value: "yes" },
            { name: "↩️ No, review setup options", value: "no" },
        ],
    });

    if (confirm === "no") {
        console.log(chalk.yellow("\n↩️ Restarting setup...\n"));
        // Reset state
        Object.keys(cliState).forEach(
            (key) => delete (cliState as any)[key]
        );

        // Restart prompts
        return runPrompts();
    }
    console.log("\n");
    // console.log(cliState);
    startLoading("Generating Plan...");

    try {
        const response = await axios.post(
            `${process.env.API_BASE_URL || "http://localhost:6000/api"}/compose`,
            cliState
        );

        // Check response success flag
        if (!response.data.success) {
            fail(response.data.message);
            process.exit(1);
        }

        const buildPlan = response.data.project;
        const plan = await parseBuildPlan(buildPlan);
        if (!plan.success) {
            fail(plan.mssg);
            process.exit(1);
        }
        succeed(plan.mssg || "Plan parsed successfully.");

        await SetupTemplates({
            repos: plan.data,
            projectName: cliState.projectName,
            setupLevel: cliState.setupUpto
        });

    } catch (error: any) {
        console.error("Full error:", error);
        console.error("Response data:", error.response?.data);
        fail(error.response?.data?.message || "Failed to generate build plan");
        process.exit(1);
    }

}
