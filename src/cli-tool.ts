import { Command } from "commander";
import { runPrompts } from "./prompts/prompt";
import { showBanner } from "./components/mislineous";

export function runCLI() {
    const program = new Command();

    program
        .name("devkit")
        .description("Create a production-ready web or mobile app with one command")
        .version("1.0.0");

    program
        .command("create")
        .description("Create a new project")
        .action(async () => {
            showBanner();
            await runPrompts();
        });

    program.parse(process.argv);
}
