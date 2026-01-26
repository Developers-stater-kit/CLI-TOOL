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
    SocialProvider ,
    PAYMENT_PROVIDER_CHOICES,
    getFrameworkChoices
} from "../types/constent";
import { section, showSummary } from "../components/mislineous";
import { fail, startLoading, succeed } from "../core/loader";



export async function runPrompts() {
    // ---------- PROJECT ----------
    section("Project Details");

    cliState.projectName = await input({
        message: "Enter the project name:",
        validate: (v) => (v ? true : "Project name is required"),
    });

    cliState.socpe = await select({
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

    // ---------- AUTH ----------
    if (["auth", "database", "payments"].includes(cliState.setupUpto)) {
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

    // ---------- DATABASE ----------
    if (["database", "payments"].includes(cliState.setupUpto)) {
        section("Database & ORM");

        cliState.dbType = await select({
            message: "Select data persistence strategy:",
            choices: DB_STRATEGY_CHOICES,
        });


        cliState.orm = await select({
            message: "Specify the database abstraction layer:",
            choices: ORM_CHOICES,
        });
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
            { name: "✅ Yes, proceed", value: "yes" },
            { name: "↩️ No, go back and edit", value: "no" },
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
    startLoading("Generating project...");

    // try {
    //     const plan = await resolveTemplates(cliState);
    //     succeed("Templates resolved successfully");

    //     console.log("\n📦 Build plan received:");
    //     console.log(plan);
    // } catch (error) {
    //     fail("Failed to resolve templates");
    //     process.exit(1);
    // }

}
