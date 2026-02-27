
import chalk from "chalk";
import { THEME } from "./theme";
import { uiSelect } from "./ui-tools";

interface TextOptions {
    type?: "default" | "heading" | "label" | "value" | "error" | "success" | "warn" | "info";
    indent?: number;  // 0 = no indent, 1 = base indent, 2 = double indent
    bold?: boolean;
    dim?: boolean;
}

export function uiText(text: string, opts: TextOptions = {}): string {
    const {
        type = "default",
        indent = 0,
        bold = false,
        dim = false
    } = opts;

    let colored: string = text;
    let prefix: string = "";

    // Apply spacing
    if (indent > 0) {
        prefix = THEME.spacing.indent.repeat(indent);
    }

    // Apply color based on type
    switch (type) {
        case "heading":
            colored = THEME.colors.secondary(text);
            if (bold) colored = chalk.bold(colored);
            break;

        case "label":
            colored = THEME.colors.muted(text);
            break;

        case "value":
            colored = THEME.colors.value(text);
            if (bold) colored = chalk.bold(colored);
            break;

        case "error":
            colored = THEME.colors.error(text);
            if (bold) colored = chalk.bold(colored);
            break;

        case "success":
            colored = THEME.colors.success(text);
            if (bold) colored = chalk.bold(colored);
            break;

        case "warn":
            colored = THEME.colors.warn(text);
            if (bold) colored = chalk.bold(colored);
            break;

        case "info":
            colored = THEME.colors.info(text);
            break;

        default:
            colored = THEME.colors.secondary(text);
            if (bold) colored = chalk.bold(colored);
            if (dim) colored = chalk.dim(colored);
    }

    return prefix + colored;
}

interface BadgeOptions {
    icon?: string;
    text: string;
    indent?: number;
    type?: "default" | "done" | "pending" | "error" | "warn" | "success";
}

export function uiIcon(opts: BadgeOptions): string {
    const { icon, text, indent = 0, type = "default" } = opts;

    let badgeIcon: string = icon || "";

    // Select icon based on type if not provided
    if (!icon) {
        switch (type) {
            case "done":
                badgeIcon = THEME.colors.success(THEME.icons.done);
                break;
            case "pending":
                badgeIcon = THEME.colors.muted(THEME.icons.pending);
                break;
            case "error":
                badgeIcon = THEME.colors.error(THEME.icons.error);
                break;
            case "warn":
                badgeIcon = THEME.colors.warn(THEME.icons.warn);
                break;
            case "success":
                badgeIcon = THEME.colors.success(THEME.icons.done);
                break;
            default:
                badgeIcon = THEME.colors.muted(THEME.icons.dot);
        }
    }

    const prefix = THEME.spacing.indent.repeat(indent);
    return `${prefix}${badgeIcon} ${uiText(text, { type: "error" })}`;
}



export function uiLine(label: string, value?: string, opts: { indent?: number; icon?: string } = {}): void {
    const { indent = 0, icon } = opts;
    const prefix = THEME.spacing.indent.repeat(indent);

    if (value) {
        const badgeIcon = icon || THEME.colors.muted(THEME.icons.pipe);
        console.log(
            `${prefix}${badgeIcon} ${uiText(label + ":", { type: "label" }).trim()} ${uiText(value, { type: "value" }).trim()}`
        );
    } else {
        console.log(prefix + uiText(label, { type: "heading", bold: true }));
    }
}


export function uiDivider(title?: string,): void {
    const width = process.stdout.columns || 50;
    if (title) {
        const line = "─".repeat(Math.max(width - title.length - 4, 2));
        console.log(`\n${THEME.colors.muted(`── ${title} ${line}`)}\n`);
    } else {
        console.log(`\n${THEME.colors.muted("─".repeat(width))}\n`);
    }
}

export function uiHeading(text: string, indent: number = 0): void {
    console.log(`\n${uiText(text, { type: "heading", bold: true, indent })}`);
}

export interface SummaryItem {
    label: string;
    value: string | number | boolean;
}

export function uiSummary(items: SummaryItem[], title?: string): void {
    if (title) {
        uiHeading(title);
    }

    items.forEach((item) => {
        uiLine(item.label, String(item.value), { indent: 1, icon: THEME.colors.muted(THEME.icons.done) });
    });
}

export async function uiConfirm(message: string): Promise<boolean> {
    const result = await uiSelect<boolean>({
        message,
        choices: [
            {
                name: THEME.colors.success("Confirm and generate"),
                value: true
            },
            {
                name: THEME.colors.warn("Review options"),
                value: false
            },
        ],
    });

    return result;
}
