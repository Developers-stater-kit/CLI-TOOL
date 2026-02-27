import { select } from "@inquirer/prompts";
import { startLoading, succeed, fail } from "../components/loader";
import { PACKAGE_MANAGER } from "../types/constent";
import { createFolder, deleteFile, deleteFolder, createFile } from "./tools/file.tool";
import { cloneRepo, removeGit } from "./tools/git.tool";
import { installPackages, runCommand, runInteractiveCommand } from "./tools/runtime.tool";
import { createEnvExample } from "./tools/env.tool";
import chalk from "chalk";
import { section } from "../components/mislineous";
import path from "node:path";
import { uiSelect } from "../components/ui/ui-tools";

type ManagerInput = {
  projectName: string;
  workflow: any[];
  metadata: {
    envVars: string[];
    dependencies: string[];
    devDependencies: string[];
  };
};

export async function manager(input: ManagerInput) {
  try {
    const projectPath = process.cwd() + "/" + input.projectName;
    const createdFiles: string[] = [];

    for (const step of input.workflow) {

      // 1. FRAMEWORK
      if (step.type === "framework") {
        const pm = await uiSelect({
          message: "Select package manager:",
          choices: PACKAGE_MANAGER,
        });

        (global as any).pm = pm;

        startLoading(`Cloning ${step.key} framework...`);
        createFolder(projectPath);

        await cloneRepo(step.repoName, projectPath);
        await removeGit(projectPath);

        succeed(`Framework initialized ✅`);

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
        section("Initializing ShadCN UI");

        const initCommand = step.commands[pm]?.init || step.commands[pm];
        await runInteractiveCommand(initCommand, projectPath);

        continue;
      }

      // 3. DB ORM
      if (step.type === "db-orm") {
        section("Setting up Database & ORM");

        if (step.files && step.files.length > 0) {
          startLoading(`Creating DB-ORM files (${step.files.length})...`);

          for (let i = 0; i < step.files.length; i++) {
            const file = step.files[i];
            const filePath = path.join(projectPath, file.path, file.name);

            try {
              createFile(filePath, file.content);
              createdFiles.push(filePath);
              process.stdout.write(`\rCreating files (${i + 1}/${step.files.length})`);
            } catch (error: any) {
              console.warn(`⚠️  Failed to create ${file.name}: ${error.message}`);
            }
          }

          console.log("\n");
          succeed(`DB-ORM files created`);
        }

        continue;
      }

      // 4. AUTHENTICATION
      if (step.type === "authentication") {
        section("Setting up Authentication");

        if (step.files && step.files.length > 0) {
          startLoading(`Creating authentication files (${step.files.length})...`);

          for (let i = 0; i < step.files.length; i++) {
            const file = step.files[i];
            const filePath = path.join(projectPath, file.path, file.name);

            try {
              createFile(filePath, file.content);
              createdFiles.push(filePath);
              process.stdout.write(`\rCreating files (${i + 1}/${step.files.length})`);
            } catch (error: any) {
              console.warn(`⚠️  Failed to create ${file.name}: ${error.message}`);
            }
          }

          console.log("\n");
          succeed(`Authentication files created`);
        }

        // Execute shadcn commands if present
        if (step.commands) {
          const pm = (global as any).pm;
          section("Installing ShadCN Components");

          const addCommand = step.commands.shadcn?.[pm];
          if (addCommand) {
            await runInteractiveCommand(addCommand, projectPath);
          }
        }

        continue;
      }
    }

    const pm = (global as any).pm;
    const { envVars, dependencies, devDependencies } = input.metadata;

    // Create .env.example BEFORE installing dependencies
    if (envVars && envVars.length > 0) {
      section("Setting Up Environment Variables");
      createEnvExample(projectPath, envVars);
      succeed(`.env.example created with ${envVars.length} variables`);
    }

    // Install Dependencies - with batching of 3 and retry logic
    if (dependencies && dependencies.length > 0) {
      const installCmd = pm === "npm" ? "install" : "add";
      const chunkSize = 3;
      const failedChunks: string[][] = [];

      // First pass - install all chunks
      for (let i = 0; i < dependencies.length; i += chunkSize) {
        const chunk = dependencies.slice(i, i + chunkSize);
        console.log(chalk.dim(`Installing: ${chunk.join(", ")}`));
        startLoading(`Installing dependencies (${i + chunk.length}/${dependencies.length})...`);

        try {
          await runCommand(`${pm} ${installCmd} ${chunk.join(" ")}`, projectPath);
        } catch (error: any) {
          console.warn(`⚠️  Batch failed: ${chunk.join(", ")}`);
          failedChunks.push(chunk);
        }
      }

      // Retry failed chunks once
      if (failedChunks.length > 0) {
        console.log("\n" + chalk.yellow(`Retrying ${failedChunks.length} failed batch(es)...`));

        for (const chunk of failedChunks) {
          console.log(chalk.dim(`Retrying: ${chunk.join(", ")}`));
          startLoading(`Retrying dependencies...`);

          try {
            await runCommand(`${pm} ${installCmd} ${chunk.join(" ")}`, projectPath);
            succeed(`Retried batch successful: ${chunk.join(", ")}`);
          } catch (error: any) {
            console.warn(`⚠️  Failed after retry: ${chunk.join(", ")}`);
          }
        }
      }

      succeed("Dependencies installed ✅");
    }

    // Install Dev Dependencies - with batching if more than 4 and retry logic
    if (devDependencies && devDependencies.length > 0) {
      const devInstallCmd = pm === "npm" ? "install -D" : "add -D";
      const failedChunks: string[][] = [];

      if (devDependencies.length > 4) {
        // Batch if more than 4 dev dependencies
        const chunkSize = 3;
        // First pass
        for (let i = 0; i < devDependencies.length; i += chunkSize) {
          const chunk = devDependencies.slice(i, i + chunkSize);
          console.log(chalk.dim(`Installing (dev): ${chunk.join(", ")}`));
          startLoading(`Installing devDependencies (${i + chunk.length}/${devDependencies.length})...`);

          try {
            await runCommand(`${pm} ${devInstallCmd} ${chunk.join(" ")}`, projectPath);
          } catch (error: any) {
            console.warn(`⚠️  Dev batch failed: ${chunk.join(", ")}`);
            failedChunks.push(chunk);
          }
        }

        // Retry failed chunks once
        if (failedChunks.length > 0) {
          console.log("\n" + chalk.yellow(`Retrying ${failedChunks.length} failed dev batch(es)...`));

          for (const chunk of failedChunks) {
            console.log(chalk.dim(`Retrying (dev): ${chunk.join(", ")}`));
            startLoading(`Retrying devDependencies...`);

            try {
              await runCommand(`${pm} ${devInstallCmd} ${chunk.join(" ")}`, projectPath);
              succeed(`Retried dev batch successful: ${chunk.join(", ")}`);
            } catch (error: any) {
              console.warn(`⚠️  Failed after retry: ${chunk.join(", ")}`);
            }
          }
        }
      } else {
        // Install all at once if 4 or less
        console.log(chalk.dim(`Installing (dev): ${devDependencies.join(", ")}`));
        startLoading(`Installing devDependencies (${devDependencies.length})...`);

        try {
          await runCommand(`${pm} ${devInstallCmd} ${devDependencies.join(" ")}`, projectPath);
        } catch (error: any) {
          console.warn(`⚠️  Dev dependency installation failed: ${error.message}`);
        }
      }

      succeed("Dev dependencies installed ✅");
    }

    // Cleanup - delete devkit.config.json and temp folder
    startLoading("Cleaning up...");
    // Delete devkit.config.json from root
    try {
      deleteFile(path.join(projectPath, "devkit.config.json"));
    } catch (error: any) {
      console.warn(`⚠️  Could not delete devkit.config.json: ${error.message}`);
    }
    succeed("Cleanup complete");

    // Success Summary
    console.log("\n" + chalk.green.bold("✅ Project setup complete!"));
    // console.log(chalk.cyan("\n📁 Created files:"));
    // createdFiles.slice(0, 10).forEach(f => console.log(chalk.gray(`   ${f}`)));
    // if (createdFiles.length > 10) {
    //   console.log(chalk.gray(`   ... and ${createdFiles.length - 10} more files`));
    // }

   

    // Open VS Code
    try {
      await runCommand('code --version', process.cwd());
 
      const openCode = await select({
        message: "Open in VS Code?",
        choices: [
          { name: "Yes", value: "yes" },
          { name: "No", value: "no" },
        ],
      });

      if (openCode === "yes") {
        await runCommand(`code ${projectPath}`, process.cwd());
        succeed("Opening VS Code...");
      }
    } catch (error) {
      // Silently fail if code not found
    }

  } catch (err: any) {
    fail(err.message);
  }
}