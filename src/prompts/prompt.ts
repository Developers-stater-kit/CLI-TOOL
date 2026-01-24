import { input, select, checkbox } from "@inquirer/prompts";
import { AuthMethod, SocialProvider } from "../types/constent";
import chalk from "chalk";
import { section, showSummary } from "../components/mislineous";
import { cliState } from "../components/state";
import { fail, startLoading, succeed } from "../core/loader";
import { resolveTemplates } from "../core/api";



export async function runPrompts() {
    // ---------- PROJECT ----------
    section("Project Details");

    cliState.projectName = await input({
        message: "What will be the name of your project?",
        validate: (v) => (v ? true : "Project name is required"),
    });

    cliState.appType = await select({
        message: "What type of project is this?",
        choices: [
            { name: "Web App", value: "web" },
            { name: "Mobile App", value: "mobile" },
        ],

    });

    cliState.framework = await select({
        message: "Choose a framework",
        choices:
            cliState.appType === "web"
                ? [
                    { name: "Next.js", value: "nextjs" },
                    { name: "React", value: "react" },
                ]
                : [{ name: "Expo", value: "expo" }],
    });

    cliState.setupUpto = await select({
        message: "How much setup do you want?",
        choices: [
            { name: "Framework only", value: "framework" },
            { name: "Up to Authentication", value: "auth" },
            { name: "Up to Database & ORM", value: "database" },
            { name: "Full setup (Payments)", value: "payments" },
        ],
    });

    // ---------- AUTH ----------
    if (["auth", "database", "payments"].includes(cliState.setupUpto)) {
        section("Authentication Setup");

        cliState.authLib = await select({
            message: "Choose authentication library",
            choices: [
                { name: "BetterAuth", value: "better-auth" },
                { name: "Clerk", value: "clerk" },
                { name: "Firebase Auth", value: "firebase-auth" },
                { name: "Supabase Auth", value: "supabase-auth" },
            ],
        });

        const authMethods = (await checkbox({
            message: "Select authentication methods",
            required: true,
            choices: [
                { name: "Email / Password", value: "email" },
                { name: "Social Login", value: "social" },
                { name: "Phone OTP", value: "otp" },
                { name: "Custom", value: "custom" },
            ],

        })) as AuthMethod[];

        cliState.authMethods = authMethods;

        if (authMethods.includes("social")) {
            section("Social Providers");

            cliState.socialProviders = (await checkbox({
                message: "Select social providers",
                required: true,
                choices: [
                    { name: "Google", value: "google" },
                    { name: "GitHub", value: "github" },
                    { name: "Apple", value: "apple" },
                    { name: "Custom Provider", value: "custom" },
                ],
            })) as SocialProvider[];
        }
    }

    // ---------- DATABASE ----------
    if (["database", "payments"].includes(cliState.setupUpto)) {
        section("Database & ORM");

        cliState.dbType = await select({
            message: "Choose database Type",
            choices: [
                { name: "SQL", value: "sql" },
                { name: "NO-SQL", value: "no-sql" },
            ]
        });

        // Determine provider choices based on selected type
        let dbProviderChoices;
        if (cliState.dbType === "sql") {
            dbProviderChoices = [
                { name: "Neon", value: "neon" },
                { name: "Supabase", value: "supabase" },
                { name: "Firebase", value: "firebase" },
            ];
        } else {
            dbProviderChoices = [
                { name: "Neon", value: "neon" },
                { name: "MongoDb", value: "mongodb" },];
        }

        cliState.dbProvider = await select({
            message: "Choose database provider",
            choices: dbProviderChoices,
        });

        cliState.orm = await select({
            message: "Choose ORM",
            choices: [
                { name: "Drizzle", value: "drizzle" },
                { name: "Prisma", value: "prisma" },
                { name: "TypeORM", value: "typeorm" },
            ],
        });
    }

    // ---------- PAYMENTS ----------
    if (cliState.setupUpto === "payments") {
        section("Payments");

        cliState.paymentProvider = await select({
            message: "Choose payment provider",
            choices: [
                { name: "Stripe", value: "stripe" },
                { name: "Razorpay", value: "razorpay" },
                { name: "Dodo Payments", value: "dodo" },
            ],
        });
    }

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
