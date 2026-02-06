import { select } from "@inquirer/prompts";
import { startLoading, succeed, fail } from "../components/loader";
import { PACKAGE_MANAGER } from "../types/constent";
import { applyFileMap, createFolder, deleteFile, deleteFolder } from "./tools/file.tool";
import { cloneRepo } from "./tools/git.tool";
import { installPackages, runCommand, runInteractiveCommand } from "./tools/runtime.tool";
import { createEnvExample } from "./tools/env.tool";
import chalk from "chalk";
import { section } from "../components/mislineous";
import path from "node:path";

type ManagerInput = {
  projectName: string;
  workflow: any[];
  metadata: {
    allEnvVars: string[];
    dependencies: string[];
    devDependencies: string[];
  };
};

export async function manager(input: ManagerInput) {

  try {
    const projectPath = process.cwd() + "/" + input.projectName;

    for (const step of input.workflow) {

      // 1. FRAMEWORK
      if (step.type === "framework") {


        const pm = await select({
          message: "Select package manager:",
          choices: PACKAGE_MANAGER,
        });
        (global as any).pm = pm;
        const dlx = pm === "pnpm" ? "pnpm dlx" : pm === "bun" ? "bunx" : "npx";
        startLoading(`Generating framework layer...`);
        createFolder(projectPath);
        succeed(`Framework Initilised 👍`);
        // await cloneRepo(step.repoName, projectPath);
        await runCommand(`${dlx} degit Developers-stater-kit/${step.repoName} ${projectPath} --force`, projectPath);
        const hasUiStep = input.workflow.some((s) => s.type === "ui");

        if (!hasUiStep) {
          startLoading(`Installing framework dependencies using ${pm}...`);
          await installPackages(pm, projectPath);
          succeed(`Framework dependencies installed`);
        }


        continue;
      }

      // 2. UI INIT (ShadCN)
      if (step.type === "ui") {
        const pm = (global as any).pm;
        section("Initializing ShadCN UI")
        const commandString = step.commands[pm].init || step.commands[pm];
        await runInteractiveCommand(commandString, projectPath);
        continue;
      }

      // 3. DB ORM
      if (step.type === "db-orm") {
        section("Database & ORM Setup");
        const tempPath = projectPath + "/temp/db-orm";

        createFolder(tempPath);

        await cloneRepo(step.repoName, tempPath);

        await applyFileMap(
          step.steps,
          tempPath,
          projectPath
        );

        continue;
      }

      // FUTURE: AUTH
      if (step.type === "authentication") {
        // later plug here
        continue;
      }

    }

    const pm = (global as any).pm;
    const { allEnvVars, dependencies, devDependencies } = input.metadata;
    const isNpm = pm === "npm";
    const installCmd = isNpm ? "install" : "add";
    const devInstallCmd = isNpm ? "install -D" : "add -D";

    if (dependencies && dependencies.length > 0) {
      const installCmd = pm === "npm" ? "install" : "add";
      console.log(chalk.dim(`\nInstalling: ${dependencies.join(", ")}`));
      startLoading(`Installing dependencies (${dependencies.length})...`);
      await runCommand(`${pm} ${installCmd} ${dependencies.join(" ")}`, projectPath);
      succeed("Dependencies synced");
    }

    // 2. Install Dev Dependencies
    if (devDependencies && devDependencies.length > 0) {
      const devInstallCmd = pm === "npm" ? "install -D" : "add -D";
      console.log(chalk.dim(`Installing (dev): ${devDependencies.join(", ")}`));
      startLoading(`Installing devDependencies (${devDependencies.length})...`);
      await runCommand(`${pm} ${devInstallCmd} ${devDependencies.join(" ")}`, projectPath);
      succeed("Dev dependencies synced");
    }

    // FINAL CLEANUP
    startLoading("Cleaning up template metadata...");

    const filesToRemove = ["LICENSE", ".gitignore", "devkit.config.json"];
    filesToRemove.forEach(file => deleteFile(path.join(projectPath, file)));

    // Remove directories
    deleteFolder(path.join(projectPath, "temp"));
    // deleteFolder(path.join(projectPath, ".git"));

    succeed("Template metadata cleaned up");

    if (allEnvVars && allEnvVars.length > 0) {
      section("Setting Up Env variables");
      createEnvExample(
        projectPath,
        allEnvVars
      );
    }

    succeed(`\n✅ Project "${input.projectName}" is ready!`);
    console.log("\n" + chalk.cyan("Next steps:"));
    console.log(chalk.white(`  1. cd ${input.projectName}`));
    console.log(chalk.white(`  2. ${pm === "npm" ? "npm run dev" : `${pm} dev`}`));

    try {
      // Check if VS Code is installed
      await runCommand('code --version', process.cwd());

      console.log("\n");
      const openCode = await select({
        message: "Would you like to open this project in VS Code?",
        choices: [
          { name: "Yes, open now", value: "yes" },
          { name: "No, I'll do it later", value: "no" },
        ],
      });

      if (openCode === "yes") {
        // Opens VS Code specifically in the new project directory
        await runCommand(`code ${projectPath}`, process.cwd());
        succeed("Opening VS Code...");
      }
    } catch (error) {
      // Silently fail if 'code' command is not found in the user's PATH
    }

  } catch (err: any) {
    fail(err.message);
  }
}
