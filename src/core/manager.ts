import fs from "fs";
import path from "node:path";
import chalk from "chalk";
import { select } from "@inquirer/prompts";
import { startLoading, succeed, fail } from "../components/loader";
import { PACKAGE_MANAGER } from "../types/constent";
import { createFolder, deleteFile, createFile, deleteFolder, renameFile } from "./tools/file.tool";
import { cloneRepo, removeGit } from "./tools/git.tool";
import { installPackages, runCommand, runInteractiveCommand } from "./tools/runtime.tool";
import { createEnvExample } from "./tools/env.tool";
import { section } from "../components/mislineous";
import { uiSelect } from "../components/ui/ui-tools";
import { buildAutoSetup, buildManualSetup } from "../components/setup-readme";

/** * TYPES 
 */
type ManagerInput = {
    projectName: string;
    workflow: any[];
    metadata: {
        envVars: string[];
        dependencies: string[];
        devDependencies: string[];
    };
    hasAuth: boolean;
};

type ProjectState = {
    projectPath: string;
    pm: string;
    installMode: "manual" | "automatic";
    shadcnInit: string | null;
    shadcnAdd: string | null;
};

/**
 * UTILS: File Handlers
 */
const fileHandler = {
    createProjectFiles: (files: any[], projectPath: string) => {
        files.forEach((file, i) => {
            const filePath = path.join(projectPath, file.path, file.name);
            try {
                createFile(filePath, file.content);
                process.stdout.write(`\rProgress: (${i + 1}/${files.length})`);
            } catch (err: any) {
                console.warn(chalk.yellow(`\n⚠️ Failed: ${file.name} - ${err.message}`));
            }
        });
        console.log("");
    },

    cleanup: (projectPath: string) => {
        try {
            deleteFile(path.join(projectPath, "devkit.config.json"));
        } catch { }
    }
};

/**
 * UTILS: Installation Helpers
 */
const installHandler = {
    async installInChunks(pm: string, type: "prod" | "dev", deps: string[], path: string) {
        const cmd = type === "prod" ? (pm === "npm" ? "install" : "add") : (pm === "npm" ? "install -D" : "add -D");
        const chunkSize = 3;

        for (let i = 0; i < deps.length; i += chunkSize) {
            const chunk = deps.slice(i, i + chunkSize);
            startLoading(`Installing ${type} deps: ${chunk.join(", ")}`);
            try {
                await runCommand(`${pm} ${cmd} ${chunk.join(" ")}`, path);
            } catch {
                // Simple retry logic
                await runCommand(`${pm} ${cmd} ${chunk.join(" ")}`, path).catch(() => { });
            }
        }
    }
};

/**
 * STEP: SETUP README
 */
function generateSetupReadme(
    state: ProjectState,
    metadata: ManagerInput["metadata"],
    mode: "manual" | "automatic"
) {
    const shared = {
        projectName: path.basename(state.projectPath),
        pm: state.pm,
        metadata: metadata,
    };

    const content = mode === "manual"
        ? buildManualSetup({
            ...shared,
            shadcnInit: state.shadcnInit,
            shadcnAdd: state.shadcnAdd,
        })
        : buildAutoSetup(shared);

    createFile(path.join(state.projectPath, "SETUP.md"), content);
}

function finalCleanup(projectPath: string) {
    const gitPath = path.join(projectPath, ".git");
    const devkitConfig = path.join(projectPath, "devkit.config.json");

    if (fs.existsSync(gitPath)) deleteFolder(gitPath);
    if (fs.existsSync(devkitConfig)) deleteFile(devkitConfig);
}
/**
 * MAIN MANAGER
 */
export async function manager(input: ManagerInput) {
    const state: ProjectState = {
        projectPath: path.join(process.cwd(), input.projectName),
        pm: "npm",
        installMode: "manual",
        shadcnInit: null,
        shadcnAdd: null
    };

    try {
        // --- PASS 1: Configuration & File Scaffolding ---
        for (const step of input.workflow) {
            switch (step.type) {
                case "framework":
                    let pmValid = false;
                    while (!pmValid) {
                        state.pm = await uiSelect({ message: "Package Manager:", choices: PACKAGE_MANAGER });
                        try {
                            await runCommand(`${state.pm} --version`, process.cwd());
                            pmValid = true;
                        } catch {
                            fail(`${state.pm} is not installed. Please choose another.`);
                        }
                    }
                    state.installMode = await uiSelect({
                        message: "Mode:",
                        choices: [
                            { name: "Auto-Install 🚀", value: "automatic" },
                            { name: "Quick-Setup ⚡", value: "manual" }
                        ]
                    });

                    startLoading(`Setting up ${step.key}...`);
                    createFolder(state.projectPath);
                    await cloneRepo(step.repoName, state.projectPath);
                    await removeGit(state.projectPath);

                    const appPath = path.join(state.projectPath, "src", "app");
                    const app2Path = path.join(state.projectPath, "src", "app2");

                    switch (input.hasAuth) {
                        case true:
                            deleteFolder(appPath);
                            renameFile(app2Path, appPath);
                            break;
                        case false:
                            deleteFolder(app2Path);
                            break;
                    }
                    const packageJsonPath = path.join(state.projectPath, "package.json");
                    if (fs.existsSync(packageJsonPath)) {
                        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
                        packageJson.name = input.projectName;
                        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf-8");
                    }
                    console.log("")
                    succeed("Framework ready ✅");
                    break;

                case "ui":
                    state.shadcnInit = step.commands[state.pm]?.init || step.commands[state.pm];
                    break;

                case "db-orm":
                    section("Database Setup");
                    if (step.files) fileHandler.createProjectFiles(step.files, state.projectPath);
                    succeed("ORM files created");
                    break;

                case "authentication":
                    section("Auth Setup");
                    if (step.files) fileHandler.createProjectFiles(step.files, state.projectPath);
                    state.shadcnAdd = step.commands?.shadcn?.[state.pm] ?? null;
                    succeed("Auth files created");
                    break;
            }
        }

        // --- PASS 2: Post-Processing ---
        section("Finalizing");
        if (input.metadata.envVars.length) {
            createEnvExample(state.projectPath, input.metadata.envVars);
            succeed(".env.example created ✅");
        }

        fileHandler.cleanup(state.projectPath);
        succeed("Cleanup complete ✅");

        if (state.installMode === "automatic") {
            section("Installing Dependencies");
            startLoading(`Installing base packages with ${state.pm}...`);
            await installPackages(state.pm, state.projectPath);
            succeed("Base packages installed ✅");

            if (state.shadcnInit) { section("Initializing  Shadcn") };
            if (state.shadcnInit) await runInteractiveCommand(state.shadcnInit, state.projectPath);
            if (state.shadcnAdd) await runInteractiveCommand(state.shadcnAdd, state.projectPath);

            section("Installing Dependencies");
            await installHandler.installInChunks(state.pm, "prod", input.metadata.dependencies, state.projectPath);
            await installHandler.installInChunks(state.pm, "dev", input.metadata.devDependencies, state.projectPath);
            succeed("Auto-install complete ✅");

            finalCleanup(state.projectPath);
            generateSetupReadme(state, input.metadata, "automatic");

            console.log("");
            section("Project Ready");
            console.log(chalk.white("  Your project is installed and ready to go."));
            console.log(chalk.gray("  Follow the steps in ") + chalk.cyan("SETUP.md") + chalk.gray(" to configure your environment and start the dev server."));
            console.log("");
        } else {
            generateSetupReadme(state, input.metadata, "manual");

            console.log("");
            section("Next Steps");
            console.log(chalk.white("  Your project is generated but not yet installed."));
            console.log(chalk.gray("  Follow the steps in ") + chalk.cyan("SETUP.md") + chalk.gray(" to get it running:"));
            console.log("");
            console.log(chalk.gray("  1. cd ") + chalk.cyan(input.projectName));
            console.log(chalk.gray("  2. Open ") + chalk.cyan("SETUP.md") + chalk.gray(" and follow each step"));
            console.log("");
        }

        // --- Final Step: VS Code ---
        const openCode = await select({
            message: "Open in VS Code?",
            choices: [{ name: "Yes", value: true }, { name: "No", value: false }]
        });
        if (openCode) await runCommand(`code ${state.projectPath} ${path.join(state.projectPath, "SETUP.md")}`, process.cwd());

    } catch (error: any) {
        fail(error.message);
    }
}