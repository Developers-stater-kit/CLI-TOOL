import chalk from "chalk";
import { select, input, checkbox } from "@inquirer/prompts";
import ora, { Ora } from "ora";
import { THEME } from "./theme";
import { uiHeading, uiIcon, uiLine, uiText } from "./base-tools";



export function getIndent(level: number = 1): string {
    return THEME.spacing.indent.repeat(level);
}

export function getGutter(): string {
    return THEME.spacing.gutter;
}

export interface InputOptions {
    message: string;
    validate?: (value: string) => true | string;
    default?: string;
    placeholder?: string;
}

export async function uiInput(opts: InputOptions): Promise<string> {
    const { message, validate, default: defaultVal, placeholder } = opts;

    try {
        return await input({
            message: uiText(message, { type: "heading" }).trim(),
            validate: validate ? (v: string) => {
                const result = validate(v);
                if (result === true) return true;
                // Return error with proper formatting
                return uiIcon({
                    type: "error",
                    text: result,
                    indent: 1
                });
            } : undefined,
            default: defaultVal,
            theme: {
                prefix: {
                    idle: THEME.colors.muted(`${THEME.spacing.indent}${THEME.icons.pending}`),
                    done: THEME.colors.success(`${THEME.spacing.indent}${THEME.icons.done}`),
                },
                style: {
                    answer: (text: string) => THEME.colors.value(text),
                    error: (text: string) => text, // Already formatted by uiBadge
                    message: (text: string) => text, // Already formatted by uiText
                }
            }
        });
    } catch (error) {
        throw new Error("Input cancelled");
    }
}

interface SelectOpts {
    name: string;
    value: string | number | boolean;
    description?: string;
}

interface SelectOptions {
    message: string;
    choices: readonly SelectOpts[];
    pageSize?: number;
    loop?: boolean;
}

export async function uiSelect<T = any>(opts: SelectOptions): Promise<T> {
    const { message, choices, pageSize = THEME.sizes.pageSize, loop = false } = opts;

    try {
        const result = await select({
            message: uiText(message, { type: "heading" }).trim(),
            choices: choices.map((c) => ({
                name: THEME.spacing.gutter + THEME.colors.primary(THEME.icons.arrow) + " " + c.name,
                value: c.value,
                description: c.description,
            })),
            pageSize,
            loop,
            theme: {
                prefix: {
                    idle: THEME.colors.muted(`${THEME.spacing.indent}${THEME.icons.pending}`),
                    done: THEME.colors.success(`${THEME.spacing.indent}${THEME.icons.done}`),
                },
                icon: {
                    cursor: "",
                },
                style: {
                    answer: (text: string) => {
                        // Remove arrow from answer display
                        const cleanText = text.replace(/^\s+/, "").replace(/^.*?→\s*/, "").trim();
                        return THEME.colors.value(cleanText);
                    },
                    highlight: (text: string) => THEME.colors.highlight(text),
                    description: (text: string) => THEME.colors.muted(text),
                    message: (text: string) => text,
                }
            }
        });
        return result as T;
    } catch (error) {
        throw new Error("Selection cancelled");
    }
}


interface CheckboxOption {
    name: string;
    value: string | number;
    description?: string;
    checked?: boolean;
}

interface CheckboxOptions {
    message: string;
    choices: readonly CheckboxOption[];
    required?: boolean;
    pageSize?: number;
    validate?: (selected: readonly any[]) => true | string;
}

export async function uiCheckbox<T = any>(opts: CheckboxOptions): Promise<T[]> {
    const { message, choices, required = false, pageSize = THEME.sizes.pageSize, validate } = opts;

    try {
        const result = await checkbox({
            message: uiText(message, { type: "heading" }).trim(),
            choices: choices.map((c) => ({
                name: c.name,
                value: c.value,
                description: c.description,
                checked: c.checked || false,
            })),
            required,
            pageSize,
            validate: validate ? (selected: readonly any[]) => {
                const result = validate([...selected]);
                if (result === true) return true;
                return uiIcon({
                    type: "error",
                    text: result,
                    // indent: 
                });
            } : undefined,
            theme: {
                prefix: {
                    idle: THEME.colors.muted(`${getIndent()}${THEME.icons.pending}`),
                    done: THEME.colors.success(`${getIndent()}${THEME.icons.done}`),
                },
                icon: {
                    cursor: " ",
                    checked: getGutter() + `${"  "}` + THEME.colors.success(THEME.icons.selected) +  `${" "}`,
                    unchecked: getGutter() + `${"  "}` + THEME.colors.muted(THEME.icons.unselected) +  `${" "}`,
                },
                
                style: {
                    answer: (text: string) => {
                        const cleanText = text
                            .replace(/^\s+/, "")
                            .replace(/[◉○]/g, "")
                            .replace(/\s+/g, " ")
                            .trim();
                        return THEME.colors.value(cleanText);
                    },
                    highlight: (text: string) => THEME.colors.highlight(text),
                    description: (text: string) => THEME.colors.muted(text),
                    message: (text: string) => text,
                    error: (text: string) => {
                        return getIndent() + THEME.colors.error(THEME.icons.error) + " " + THEME.colors.error(text);
                    },
                }
            }
        });
        return result as T[];
    } catch (error) {
        throw new Error("Selection cancelled");
    }
}

let globalSpinner: Ora | null = null;

export function uiLoader(text: string): void {
    if (globalSpinner) globalSpinner.stop();

    console.log("");
    globalSpinner = ora({
        prefixText: getIndent(),
        text: THEME.colors.secondary(text),
        spinner: {
            interval: 100,
            frames: [
                THEME.colors.muted("◜"),
                THEME.colors.muted("◠"),
                THEME.colors.muted("◝"),
                THEME.colors.muted("◞"),
                THEME.colors.muted("◡"),
                THEME.colors.muted("◟"),
            ],
        },
    }).start();
}

export function uiSuccess(text: string): void {
    if (globalSpinner) {
        console.log("");
        globalSpinner.stopAndPersist({
            symbol: THEME.colors.highlight(THEME.icons.success),
            text: " " + THEME.colors.highlight(text)
        });
        globalSpinner = null;
        console.log("");
    } else {
        console.log(uiIcon({ type: "success", text, indent: 1 }));
    }
}

export function uiFail(text: string): void {
    if (globalSpinner) {
        globalSpinner.stopAndPersist({
            symbol: uiIcon({ type: "error", text: "", indent: 1 }).trim(),
            text: uiText(text, { type: "error" })
        });
        globalSpinner = null;
    } else {
        console.log(uiIcon({ type: "error", text, indent: 1 }));
    }
}

export function uiWarn(text: string): void {
    if (globalSpinner) {
        globalSpinner.warn(uiIcon({ type: "warn", text, indent: 1 }));
        globalSpinner = null;
    } else {
        console.log(uiIcon({ type: "warn", text, indent: 1 }));
    }
}


export function uiStep(text: string, indent: number = 1): void {
    console.log(`${getIndent(indent)}${THEME.colors.muted(THEME.icons.arrow)} ${THEME.colors.muted(text)}`);
}

export function uiInfo(text: string, indent: number = 1): void {
    console.log(
        `${THEME.spacing.indent.repeat(indent)}${THEME.colors.info(THEME.icons.dot)} ${THEME.colors.info(text)}`
    );
}











export function uiError(title: string, message: string): void {
    console.log("");
    console.log(THEME.colors.error(chalk.bold(`${THEME.icons.error} ${title}`)));
    console.log(THEME.colors.muted(message));
    console.log("");
}

/* ══════════════════════════════════════════════════════════
   SUCCESS BOX: Highlighted success display
   ══════════════════════════════════════════════════════════ */

export function uiSuccessBox(title: string, message: string): void {
    console.log("");
    console.log(THEME.colors.success(chalk.bold(`${THEME.icons.done} ${title}`)));
    console.log(THEME.colors.muted(message));
    console.log("");
}
