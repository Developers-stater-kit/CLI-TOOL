/* ══════════════════════════════════════════════════════════
   THEME TOKENS - Single source of truth for all colors/spacing
   ══════════════════════════════════════════════════════════ */

import chalk from "chalk";

   export const THEME = {
    colors: {
        // Primary
        primary: chalk.cyan,           // Main accent
        secondary: chalk.white,        // Labels, text
        muted: chalk.gray,             // Dim text, helpers

        // Status
        success: chalk.green,          // Done, completed
        error: chalk.red,              // Errors, failures
        warn: chalk.yellow,            // Warnings, pending
        info: chalk.blue,              // Info messages

        // Semantic
        value: chalk.cyan,             // User input values
        highlight: chalk.hex("#60d0ff"), // Bright accent
    },

    spacing: {
        indent: "  ",                  // 2 spaces base indent
        gutter: "    ",                // 4 spaces for option/item indent
    },

    icons: {
        // State indicators
        done: "◇",                     // Completed
        pending: "?",                  // Awaiting input
        error: "⨯",                    // Error/invalid (more visually distinct)
        warn: "⚠",                     // Warning

        // Selection indicators
        selected: "◉",                 // Checked/active
        unselected: "○",               // Unchecked/inactive

        // Connectors
        pipe: "│",                     // Vertical line
        arrow: "→",                    // Right arrow
        dot: "•",
        // Bullet point
        success: "✔",                  // Success indicator
        fail: "✖",                    // Fail indicator
    },

    sizes: {
        pageSize: 8,
        minWidth: 40,
    }
};