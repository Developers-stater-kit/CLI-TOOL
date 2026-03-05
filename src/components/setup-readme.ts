/**
 * SETUP README TEMPLATES
 * Generates SETUP.md content for both manual and automatic modes
 * All provider detection is based on metadata.envVars from the backend response
 */

// ─── SHARED HEADER ────────────────────────────────────────────────────────────

const BANNER = `\`\`\`
██████╗ ███████╗██╗   ██╗██████╗ ██╗   ██╗██╗██╗     ██████╗ ███████╗
██╔══██╗██╔════╝██║   ██║██╔══██╗██║   ██║██║██║     ██╔══██╗██╔════╝
██║  ██║█████╗  ██║   ██║██████╔╝██║   ██║██║██║     ██║  ██║███████╗
██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══██╗██║   ██║██║██║     ██║  ██║╚════██║
██████╔╝███████╗ ╚████╔╝ ██████╔╝╚██████╔╝██║███████╗██████╔╝███████║
╚═════╝ ╚══════╝  ╚═══╝  ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝ ╚══════╝
\`\`\``;

function buildHeader(projectName: string): string {
    return [
        BANNER,
        "",
        `# 🙏 Thank you for using DevBuilds!`,
        "",
        `> Your project **${projectName}** has been generated successfully.`,
        `> Follow the steps below to get it up and running.`,
        "",
        "---",
        "",
    ].join("\n");
}

function buildFooter(): string {
    return [
        "",
        "---",
        "",
        "## 💬 Feedback, Support, & Contributing",
        "",
        "If you ran into issues, have suggestions, or want to contribute, reach out or join the project:",
        "",
        "- 🐙 GitHub: [Developers-starter-kit/CLI-TOOL](https://github.com/Developers-stater-kit/CLI-TOOL)",
        "- 💼 LinkedIn: [Debojeet Karmakar](https://www.linkedin.com/in/debojeet-karmakar-852820210/)",
        "",
        "> _This is an open-source project!_ If you're interested in contributing, feel free to connect on LinkedIn or open an issue/PR on GitHub.",
        "",
        "> _Built for modern developers. No setup hassle. Just code your app._",
        "",
    ].join("\n");
}

// ─── PROVIDER CONFIGS ─────────────────────────────────────────────────────────
// Add new providers here as they are supported — no changes needed elsewhere

const AUTH_PROVIDER_CONFIG: Record<string, {
    label: string;
    secretCommand?: string;
    envBlock: string[];
    envKeyMatch: string;   // key to detect this provider from envVars
}> = {
    betterauth: {
        label: "BetterAuth",
        secretCommand: "openssl rand -base64 32",
        envKeyMatch: "BETTER_AUTH",
        envBlock: [
            "BETTER_AUTH_SECRET=your_generated_secret",
            "BETTER_AUTH_URL=http://localhost:3000",
        ],
    },
    clerk: {
        label: "Clerk",
        envKeyMatch: "CLERK",
        envBlock: [
            "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key",
            "CLERK_SECRET_KEY=your_secret_key",
        ],
    },
    nextauth: {
        label: "NextAuth",
        secretCommand: "openssl rand -base64 32",
        envKeyMatch: "NEXTAUTH",
        envBlock: [
            "NEXTAUTH_SECRET=your_generated_secret",
            "NEXTAUTH_URL=http://localhost:3000",
        ],
    },
};

const ORM_CONFIG: Record<string, {
    migrationCmd: string;
    useNpx?: boolean;
    envKeyMatch: string;  // key to detect this orm from dependencies
}> = {
    drizzle: {
        migrationCmd: "db:push",
        envKeyMatch: "drizzle",
    },
    prisma: {
        migrationCmd: "prisma migrate dev",
        useNpx: true,
        envKeyMatch: "prisma",
    },
    typeorm: {
        migrationCmd: "typeorm migration:run",
        useNpx: true,
        envKeyMatch: "typeorm",
    },
};

const DB_PROVIDER_CONFIG: Record<string, {
    guide: string;
    envKeyMatch: string;  // key to detect this provider from envVars or dependencies
}> = {
    neon: {
        guide: "Get your connection string from [Neon Console](https://console.neon.tech) → Your Project → Connection Details",
        envKeyMatch: "neon",
    },
    supabase: {
        guide: "Get your connection string from [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → Database",
        envKeyMatch: "supabase",
    },
    planetscale: {
        guide: "Get your connection string from [PlanetScale Dashboard](https://app.planetscale.com) → Your Database → Connect",
        envKeyMatch: "planetscale",
    },
    standard: {
        guide: "Get your connection string from your local/docker instance (e.g. `postgresql://user:password@localhost:5432/dbname`)",
        envKeyMatch: "DATABASE_URL",
    },
};

const SOCIAL_PROVIDER_CONFIG: Record<string, {
    label: string;
    steps: string[];
    callbackPath: string;
    envKeyMatch: string;  // key to detect this provider from envVars
    envBlock: string[];
}> = {
    google: {
        label: "Google OAuth",
        envKeyMatch: "GOOGLE",
        steps: [
            "1. Go to [Google Cloud Console](https://console.cloud.google.com)",
            "2. Navigate to **APIs & Services → Credentials**",
            "3. Create **OAuth 2.0 Client ID** credentials",
        ],
        callbackPath: "/api/auth/callback/google",
        envBlock: [
            "GOOGLE_CLIENT_ID=your_google_client_id",
            "GOOGLE_CLIENT_SECRET=your_google_client_secret",
        ],
    },
    github: {
        label: "GitHub OAuth",
        envKeyMatch: "GITHUB",
        steps: [
            "1. Go to [GitHub Developer Settings](https://github.com/settings/developers)",
            "2. Click **New OAuth App**",
            "3. Fill in your app details",
        ],
        callbackPath: "/api/auth/callback/github",
        envBlock: [
            "GITHUB_CLIENT_ID=your_github_client_id",
            "GITHUB_CLIENT_SECRET=your_github_client_secret",
        ],
    },
    discord: {
        label: "Discord OAuth",
        envKeyMatch: "DISCORD",
        steps: [
            "1. Go to [Discord Developer Portal](https://discord.com/developers/applications)",
            "2. Create a **New Application**",
            "3. Go to **OAuth2** settings",
        ],
        callbackPath: "/api/auth/callback/discord",
        envBlock: [
            "DISCORD_CLIENT_ID=your_discord_client_id",
            "DISCORD_CLIENT_SECRET=your_discord_client_secret",
        ],
    },
};

// ─── METADATA TYPE ────────────────────────────────────────────────────────────

type Metadata = {
    envVars: string[];
    dependencies: string[];
    devDependencies: string[];
};

// ─── SHARED TYPES ─────────────────────────────────────────────────────────────

export type SetupInput = {
    projectName: string;
    pm: string;
    metadata: Metadata;
};

export type ManualTemplateInput = SetupInput & {
    shadcnInit: string | null;
    shadcnAdd: string | null;
};

export type AutoTemplateInput = SetupInput;

// ─── DETECTION HELPERS ────────────────────────────────────────────────────────

function detectAuthProvider(envVars: string[]): string | null {
    for (const [key, config] of Object.entries(AUTH_PROVIDER_CONFIG)) {
        if (envVars.some(v => v.toUpperCase().includes(config.envKeyMatch))) {
            return key;
        }
    }
    return null;
}

function detectDbProvider(envVars: string[], dependencies: string[]): string | null {
    const all = [...envVars, ...dependencies].map(v => v.toLowerCase());
    for (const [key, config] of Object.entries(DB_PROVIDER_CONFIG)) {
        if (key === "standard") continue; // fallback, check last
        if (all.some(v => v.includes(config.envKeyMatch.toLowerCase()))) {
            return key;
        }
    }
    // fallback — if DATABASE_URL exists but no specific provider matched
    if (envVars.some(v => v.includes("DATABASE_URL"))) return "standard";
    return null;
}

function detectOrm(dependencies: string[], devDependencies: string[]): string | null {
    const all = [...dependencies, ...devDependencies].map(v => v.toLowerCase());
    for (const [key, config] of Object.entries(ORM_CONFIG)) {
        if (all.some(v => v.includes(config.envKeyMatch.toLowerCase()))) {
            return key;
        }
    }
    return null;
}

function detectSocialProviders(envVars: string[]): string[] {
    return Object.entries(SOCIAL_PROVIDER_CONFIG)
        .filter(([_, config]) => envVars.some(v => v.toUpperCase().includes(config.envKeyMatch)))
        .map(([key]) => key);
}

// ─── SECTION BUILDERS ─────────────────────────────────────────────────────────

function buildEnvSection(stepCount: number, envVars: string[]): { section: string; next: number } {
    if (envVars.length === 0) return { section: "", next: stepCount };

    const section = [
        `## Step ${stepCount} — Set up environment variables`,
        "",
        "Copy `.env.example` to `.env` and fill in your values:",
        "",
        "```bash",
        "cp .env.example .env",
        "```",
        "",
        "Variables you need to configure:",
        "",
        ...envVars.map(v => `- \`${v}\``),
    ].join("\n");

    return { section, next: stepCount + 1 };
}

function buildDbSection(stepCount: number, dbProvider: string): { section: string; next: number } {
    const config = DB_PROVIDER_CONFIG[dbProvider] ?? DB_PROVIDER_CONFIG["standard"];

    const section = [
        `## Step ${stepCount} — Configure Database`,
        "",
        config.guide,
        "",
        "```env",
        "DATABASE_URL=your_database_connection_string",
        "```",
    ].join("\n");

    return { section, next: stepCount + 1 };
}

function buildAuthSection(stepCount: number, authProvider: string): { sections: string[]; next: number } {
    const config = AUTH_PROVIDER_CONFIG[authProvider];
    if (!config) return { sections: [], next: stepCount };

    const lines = [
        `## Step ${stepCount} — Configure ${config.label}`,
        "",
    ];

    if (config.secretCommand) {
        lines.push(
            "Generate a secure secret:",
            "",
            "```bash",
            config.secretCommand,
            "```",
            "",
        );
    } else {
        lines.push(`Get your credentials from the ${config.label} dashboard.`, "");
    }

    lines.push(
        "```env",
        ...config.envBlock,
        "```",
    );

    return { sections: [lines.join("\n")], next: stepCount + 1 };
}

function buildSocialSections(stepCount: number, socialProviders: string[]): { sections: string[]; next: number } {
    const sections: string[] = [];
    let count = stepCount;

    for (const provider of socialProviders) {
        const config = SOCIAL_PROVIDER_CONFIG[provider];
        if (!config) continue;

        sections.push([
            `## Step ${count} — ${config.label}`,
            "",
            ...config.steps,
            `4. Add \`http://localhost:3000${config.callbackPath}\` as the redirect/callback URI`,
            "",
            "```env",
            ...config.envBlock,
            "```",
        ].join("\n"));

        count++;
    }

    return { sections, next: count };
}

function buildMigrationSection(stepCount: number, orm: string, pm: string): { section: string; next: number } {
    const config = ORM_CONFIG[orm];
    const fullCmd = config?.useNpx
        ? `npx ${config.migrationCmd}`
        : `${pm} run ${config?.migrationCmd ?? "db:push"}`;

    const section = [
        `## Step ${stepCount} — Run database migrations`,
        "",
        "```bash",
        fullCmd,
        "```",
    ].join("\n");

    return { section, next: stepCount + 1 };
}

// ─── MANUAL MODE ──────────────────────────────────────────────────────────────

export function buildManualSetup(input: ManualTemplateInput): string {
    const { projectName, pm, metadata, shadcnInit, shadcnAdd } = input;
    const { envVars, dependencies, devDependencies } = metadata;

    const installCmd = pm === "npm" ? "i" : "add";
    const devFlag = pm === "npm" ? "install -D" : "add -D";

    // Detect from metadata
    const authProvider = detectAuthProvider(envVars);
    const dbProvider = detectDbProvider(envVars, dependencies);
    const orm = detectOrm(dependencies, devDependencies);
    const socialProviders = detectSocialProviders(envVars);

    let stepCount = 1;
    const sections: string[] = [];

    // Step — Navigate
    sections.push([
        `## Step ${stepCount++} — Navigate to your project`,
        "",
        "```bash",
        `cd ${projectName}`,
        "```",
    ].join("\n"));

    // Step — Install base
    sections.push([
        `## Step ${stepCount++} — Install base dependencies`,
        "",
        "```bash",
        `${pm} install`,
        "```",
    ].join("\n"));

    // Step — Shadcn init
    if (shadcnInit) {
        sections.push([
            `## Step ${stepCount++} — Initialize ShadCN UI`,
            "",
            "```bash",
            shadcnInit,
            "```",
        ].join("\n"));
    }

    // Step — Extra dependencies
    if (dependencies.length > 0) {
        sections.push([
            `## Step ${stepCount++} — Install extra dependencies`,
            "",
            "Packages to install:",
            "",
            ...dependencies.map(d => `- \`${d}\``),
            "",
            "Run:",
            "",
            "```bash",
            `${pm} ${installCmd} ${dependencies.join(" ")}`,
            "```",
        ].join("\n"));
    }

    // Step — Dev dependencies
    if (devDependencies.length > 0) {
        sections.push([
            `## Step ${stepCount++} — Install dev dependencies`,
            "",
            "Dev packages to install:",
            "",
            ...devDependencies.map(d => `- \`${d}\``),
            "",
            "Run:",
            "",
            "```bash",
            `${pm} ${devFlag} ${devDependencies.join(" ")}`,
            "```",
        ].join("\n"));
    }

    // Step — Shadcn add
    if (shadcnAdd) {
        const components = shadcnAdd.split("add")[1]?.trim().split(" ").filter(Boolean) ?? [];
        sections.push([
            `## Step ${stepCount++} — Add ShadCN UI Components`,
            "",
            "Components to be installed:",
            "",
            ...components.map(c => `- \`${c}\``),
            "",
            "Run:",
            "",
            "```bash",
            shadcnAdd,
            "```",
        ].join("\n"));
    }

    // Step — Env vars
    const envResult = buildEnvSection(stepCount, envVars);
    if (envResult.section) { sections.push(envResult.section); stepCount = envResult.next; }

    // Step — Database
    if (dbProvider) {
        const dbResult = buildDbSection(stepCount, dbProvider);
        sections.push(dbResult.section);
        stepCount = dbResult.next;
    }

    // Step — Auth
    if (authProvider) {
        const authResult = buildAuthSection(stepCount, authProvider);
        sections.push(...authResult.sections);
        stepCount = authResult.next;
    }

    // Step — Social providers
    if (socialProviders.length > 0) {
        const socialResult = buildSocialSections(stepCount, socialProviders);
        sections.push(...socialResult.sections);
        stepCount = socialResult.next;
    }

    // Step — Migrations
    if (orm) {
        const migResult = buildMigrationSection(stepCount, orm, pm);
        sections.push(migResult.section);
        stepCount = migResult.next;
    }

    // Step — Start dev server
    sections.push([
        `## Step ${stepCount++} — Start the dev server`,
        "",
        "```bash",
        `${pm} run dev`,
        "```",
    ].join("\n"));

    return [
        buildHeader(projectName),
        sections.join("\n\n"),
        buildFooter(),
    ].join("\n");
}

// ─── AUTOMATIC MODE ───────────────────────────────────────────────────────────

export function buildAutoSetup(input: AutoTemplateInput): string {
    const { projectName, pm, metadata } = input;
    const { envVars, dependencies, devDependencies } = metadata;

    // Detect from metadata
    const authProvider = detectAuthProvider(envVars);
    const dbProvider = detectDbProvider(envVars, dependencies);
    const orm = detectOrm(dependencies, devDependencies);
    const socialProviders = detectSocialProviders(envVars);

    let stepCount = 1;
    const sections: string[] = [];

    // Intro note
    sections.push([
        `> ✅ All packages have been installed automatically.`,
        `> You just need to configure your environment and you're good to go!`,
    ].join("\n"));

    // Step — Navigate
    sections.push([
        `## Step ${stepCount++} — Navigate to your project`,
        "",
        "```bash",
        `cd ${projectName}`,
        "```",
    ].join("\n"));

    // Step — Env vars
    const envResult = buildEnvSection(stepCount, envVars);
    if (envResult.section) { sections.push(envResult.section); stepCount = envResult.next; }

    // Step — Database
    if (dbProvider) {
        const dbResult = buildDbSection(stepCount, dbProvider);
        sections.push(dbResult.section);
        stepCount = dbResult.next;
    }

    // Step — Auth
    if (authProvider) {
        const authResult = buildAuthSection(stepCount, authProvider);
        sections.push(...authResult.sections);
        stepCount = authResult.next;
    }

    // Step — Social providers
    if (socialProviders.length > 0) {
        const socialResult = buildSocialSections(stepCount, socialProviders);
        sections.push(...socialResult.sections);
        stepCount = socialResult.next;
    }

    // Step — Migrations
    if (orm) {
        const migResult = buildMigrationSection(stepCount, orm, pm);
        sections.push(migResult.section);
        stepCount = migResult.next;
    }

    // Step — Start dev server
    sections.push([
        `## Step ${stepCount++} — Start the dev server`,
        "",
        "```bash",
        `${pm} run dev`,
        "```",
        "",
        "Your app will be running at **http://localhost:3000** 🚀",
    ].join("\n"));

    return [
        buildHeader(projectName),
        sections.join("\n\n"),
        buildFooter(),
    ].join("\n");
}