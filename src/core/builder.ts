import { exec } from "child_process";
import { promisify } from "util";
import { select } from "@inquirer/prompts";
import { startLoading, succeed, fail } from "../components/loader";
import path from "path";
import fs from "fs";
import { PACKAGE_MANAGER, SetupUpto } from "../types/constent";

const execAsync = promisify(exec);



type Input = {
    repos: {
        repoName: string;
        order: number;
    }[],
    projectName: string,
    setupLevel: SetupUpto,
}




async function isCommandAvailable(cmd: string): Promise<boolean> {
    try {
        await execAsync(`${cmd} --version`);
        return true;
    } catch {
        return false;
    }
}


export async function SetupTemplates(input: Input) {
    try {
        const projectPath = path.join(process.cwd(), input.projectName);

        startLoading(`Creating project folder: ${input.projectName}`);
        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath, { recursive: true });
        }
        succeed(`Project folder created`);

        const frameworkRepo = input.repos[0];
        startLoading(`Generating ${frameworkRepo.repoName}...`);

        const repoUrl = `https://github.com/Developers-stater-kit/${frameworkRepo.repoName}.git`;
        await execAsync(`git clone ${repoUrl} ${projectPath}`);

        succeed(`Framework Generated successfully`);

        if (input.setupLevel === "framework") {
            startLoading(`Cleaning up config files...`);
            const configPath = path.join(projectPath, "devkit.config.json");
            if (fs.existsSync(configPath)) {
                fs.unlinkSync(configPath);
            }
        }


        console.log("\n");
        const packageManager = await select({
            message: "Select package manager:",
            choices: PACKAGE_MANAGER,
        });

        const isInstalled = await isCommandAvailable(packageManager);
        if (!isInstalled) {
            fail(`${packageManager} is not installed on your system.`);
            console.log(`Please install it or try: npm install -g ${packageManager}`);
            process.exit(1);
        }

        // 5️⃣ Run install in project folder
        startLoading(`Running ${packageManager} install...`);
        try {
            await execAsync(`${packageManager} install`, {
                cwd: projectPath,
                env: { ...process.env, PATH: process.env.PATH } // Ensures PATH is passed
            });
            succeed(`Dependencies installed`);
        } catch (installError: any) {
            fail(`Installation failed. Make sure ${packageManager} is installed globally.`);
            console.error(installError.stderr);
            process.exit(1);
        }

        console.log(`\n✅ Project ready at: ${projectPath}`);
        console.log(`\nNext steps:\n  cd ${input.projectName}\n  ${packageManager} run dev`);
    } catch (error: any) {
        fail(`Setup failed: ${error.message}`);
        process.exit(1);
    }
}