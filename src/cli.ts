import { Command } from "commander";
import { runPrompts } from "./prompts/prompt";
import { showBanner } from "./components/mislineous";
import { select } from "@inquirer/prompts";
import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { startLoading, succeed } from "./components/loader";
import { emptyDirectory } from "./core/tools/file.tool";

export function runCLI() {
    const program = new Command();

    program
        .name("dvkit")
        .description("Create a production-ready web or mobile app with one command")
        .version("1.0.0");

    program
        .command("init [dir]") // [dir] makes it optional
        .description("Create a new project")
        .action(async (dir) => {
            
            console.log('\n\n');
            showBanner();

            let targetPath = dir ? path.resolve(process.cwd(), dir) : null;

            try {
                // 1. If a directory is specified, check if it's empty
                if (targetPath && fs.existsSync(targetPath)) {
                    const files = fs.readdirSync(targetPath);
                    
                    if (files.length > 0) {
                        console.log(chalk.red(`\n⚠️  The directory ${chalk.bold(dir)} is not empty.`));
                        
                        const action = await select({
                            message: "How would you like to proceed?",
                            choices: [
                                { name: "Wipe directory & proceed", value: "clear" },
                                { name: "Abort", value: "cancel" }
                            ]
                        });

                        // Clear the folder (excluding system files if necessary)
                        startLoading("Clearing directory...");
                        emptyDirectory(targetPath);
                        succeed("Directory cleared");
                    }
                }

                // 2. Run Prompts (Pass targetPath to skip name input or set default)
                await runPrompts(targetPath);

            } catch (error: any) {
                if (error.message === "Selection cancelled" || "Input cancelled") {
                    console.log(chalk.yellow("\n\n👋 Setup cancelled. See you next time!"));
                    process.exit(0);
                }
                
                console.error(chalk.red("\nSome Error occurred:"), error.message);
                process.exit(1);
            }
        });

    program.parse(process.argv);
}