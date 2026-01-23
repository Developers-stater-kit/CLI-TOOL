import chalk from "chalk";
import { CliState } from "../types/constent";
export function showBanner() {
    console.log(
        chalk.cyanBright.dim(`
██████╗ ███████╗██╗   ██╗██╗  ██╗██╗████████╗
██╔══██╗██╔════╝██║   ██║██║ ██╔╝██║╚══██╔══╝
██║  ██║█████╗  ██║   ██║█████╔╝ ██║   ██║   
██║  ██║██╔══╝  ██║   ██║██╔═██╗ ██║   ██║   
██████╔╝███████╗╚██████╔╝██║  ██╗██║   ██║   
╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝   ╚═╝   
`)
    );
    console.log(chalk.gray("Create a production-ready app setup in minutes\n"));
};

export const section = (title: string) => {
    console.log("\n" + chalk.bold.blue(`▶ ${title}`));
};


export function showSummary(state: CliState) {
    if (state.projectName) {
        console.log(`${chalk.gray("Project")}      ${state.projectName}`);
    }
    if (state.appType) {
        console.log(`${chalk.gray("Type")}         ${state.appType}`);
    }
    if (state.framework) {
        console.log(`${chalk.gray("Framework")}    ${state.framework}`);
    }
    if (state.authLib) {
        console.log(`${chalk.gray("Auth")}         ${state.authLib}`);
    }
    if (state.authMethods && state.authMethods.length > 0) {
        console.log(`${chalk.gray("Auth Methods")} ${state.authMethods.join(", ")}`);
    }
    if (state.socialProviders && state.socialProviders.length > 0) {
        console.log(`${chalk.gray("Social")}       ${state.socialProviders.join(", ")}`);
    }
    if (state.dbType) {
        console.log(`${chalk.gray("DB Type")}      ${state.dbType}`);
    }
    if (state.dbProvider) {
        console.log(`${chalk.gray("Database")}     ${state.dbProvider}`);
    }
    if (state.orm) {
        console.log(`${chalk.gray("ORM")}          ${state.orm}`);
    }
    if (state.paymentProvider) {
        console.log(`${chalk.gray("Payments")}     ${state.paymentProvider}`);
    }
}