import chalk from "chalk";
import { CliState } from "../types/constent";
import gradient from "gradient-string";
import figlet from "figlet";


export function showBanner() {
    const base = figlet.textSync("DEVBUILDS", {
        font: "ANSI Shadow",
        horizontalLayout: "default",
    });

    // Layered gradient
    console.log(
        gradient("#b0b0b0", "#8a8a8a", "#a1a1a1").multiline(base)
    );

    // Small badge + subtitle
    console.log(
        // chalk.bgCyan.black(" dvkit ") +
        chalk.gray("Generate production-ready setups in minutes")
    );

    // console.log(chalk.gray("─".repeat(60)) + "\n");

}


export const UI = {
    pipe: chalk.gray("│"),
    arrow: chalk.gray("→"),
    dot: chalk.gray("•"),
    diamond: chalk.gray("◇"),
};


export function section(title: string) {
    const line = "─".repeat(46 - title.length);
    console.log(
      "\n" +
      chalk.gray("── ") +
      chalk.white(title) +
      " " +
      chalk.gray(line)
    );
  }
  
  // ─── TAG BADGE (like blue “skills”) ───────────
  // [ dvkit ]
  
  export function tag(text: string) {
    return chalk.bgCyan.black(` ${text} `);
  }
  
  // ─── SMALL LABEL + VALUE ──────────────────────
  // │ Project: my-app
  
  export function label(key: string, value: string) {
    console.log(
      `${UI.pipe} ${chalk.gray(key + ":")} ${chalk.cyan(value)}`
    );
  }



export function showSummary(state: CliState) {
    if (state.projectName) {
        console.log(`${chalk.gray("Project")}                   ${state.projectName}`);
    }
    if (state.scope) {
        console.log(`${chalk.gray("Scope")}                     ${state.scope}`);
    }
    if (state.appType) {
        console.log(`${chalk.gray("Type")}                      ${state.appType}`);
    }
    if (state.framework) {
        console.log(`${chalk.gray("Framework")}                 ${state.framework}`);
    }
    if (state.authLib) {
        console.log(`${chalk.gray("Auth")}                      ${state.authLib}`);
    }
    if (state.authMethods && state.authMethods.length > 0) {
        console.log(`${chalk.gray("Auth Methods")}              ${state.authMethods.join(", ")}`);
    }
    if (state.socialProviders && state.socialProviders.length > 0) {
        console.log(`${chalk.gray("Social")}                    ${state.socialProviders.join(", ")}`);
    }
    if (state.dbEngine) {
        console.log(`${chalk.gray("DB Engine")}                 ${state.dbEngine}`);
    }
    if (state.dbProvider) {
        console.log(`${chalk.gray("DB Provider")}               ${state.dbProvider}`);
    }
    if (state.orm) {
        console.log(`${chalk.gray("ORM")}                       ${state.orm}`);
    }
    // not for MVP
    // if (state.paymentProvider) {
    //     console.log(`${chalk.gray("Payments")}     ${state.paymentProvider}`);
    // }
}