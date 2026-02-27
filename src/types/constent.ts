export type AppType = "web" | "mobile"
export type ScopeType = "frontend" | "backend" | "fullstack"
export type AuthMethod = "email" | "social" | "otp";
export type SocialProvider = "google" | "github";
export type SetupUpto = "framework" | "auth" | "db-orm" | "payments";

export interface CliState {
  projectName?: string;
  scope?: ScopeType;
  appType?: AppType;
  framework?: string;
  isShadcn?: boolean;
  setupUpto?: SetupUpto;

  dbEngine?: string;
  dbProvider?: string;
  orm?: string;

  authLib?: string;
  authMethods?: AuthMethod[];
  socialProviders?: SocialProvider[];

  // paymentProvider?: string; // not for MVP
}



export const PROJECT_SCOPE_CHOICES = [
  // { name: "Frontend Development", value: "frontend" },
  // { name: "Backend Development", value: "backend" },
  { name: "Fullstack Development", value: "fullstack" },
] as const;

export const PROJECT_TYPE_CHOICES = [
  { name: "Web Application", value: "web" },
  // { name: "Mobile Application", value: "mobile" },
] as const;

    
export const FRAMEWORK_MAPPING = {
  web: [
    { name: "Next.js", value: "nextjs" },
    // { name: "React", value: "react" },
  ],
  mobile: [
    { name: "Expo", value: "expo" },
  ]
};

export const UI_LIB_CHOICE = [
  { name: "Yes {Recommended}", value: true },
  { name: "No", value: false }
] as const;


export const PROJECT_SETUP_CHOICES = [
  { name: "Minimal (Base Framework)", value: "framework" },
  { name: "Data Persistence (DB & ORM)", value: "db-orm" },
  { name: "Authentication Layer", value: "auth" },
  // { name: "Payment Gateways", value: "payments" }, // Not for MVP
] as const;

export const DB_ENGINE_CHOICES = [
  { name: "PostgreSQL", value: "pg" },
  { name: "MySQL", value: "mysql" },
  // { name: "SQLite", value: "sqlite" },
] as const;

export const DB_PROVIDER_MAPPING = {
  pg: [
    { name: "Standard (Local/Docker)", value: "standard" },
    { name: "Neon (Serverless Postgres)", value: "neon" },
    // { name: "Supabase", value: "supabase" },
    // { name: "Vercel Postgres", value: "vercel" },
  ],
  mysql: [
    { name: "Standard (Local/Docker)", value: "standard" },
    // { name: "PlanetScale", value: "planetscale" },
    // { name: "Tidb", value: "tidb" },
  ],
  // sqlite: [
  //   { name: "Local ", value: "local" },
  //   { name: "Turso (LibSQL)", value: "turso" },
  // ]
};

export const ORM_CHOICES = [
  { name: "Drizzle (High-performance & SQL-centric)", value: "drizzle" },
  // { name: "Prisma (Productivity-focused & Type-safe)", value: "prisma" },
  // { name: "TypeORM (Standard Enterprise Architecture)", value: "typeorm" },
] as const;

export const AUTH_PROVIDER_CHOICES = [
  { name: "BetterAuth (Modern, Type-safe)", value: "betterauth" },
  // { name: "Next-Auth (Standard, Battle-tested)", value: "auth0" },
] as const;

export const AUTH_METHOD_CHOICES = [
  { name: "Credentials (Email/Password)", value: "email" },
  { name: "OAuth | Social Providers", value: "social" },
] as const;

export const SOCIAL_PROVIDER_CHOICES = [
  { name: "Google", value: "google" },
  { name: "GitHub", value: "github" },
] as const

// not for MVP
export const PAYMENT_PROVIDER_CHOICES = [
  // { name: "Stripe (Global Standard)", value: "stripe" },
  // { name: "Razorpay (India-specific Focus)", value: "razorpay" },
  { name: "Dodo Payments (Merchant of Record)", value: "dodo" },
] as const;

export const PACKAGE_MANAGER = [
  { name: "bun", value: "bun" },
  { name: "npm", value: "npm" },
  { name: "pnpm", value: "pnpm" }
] as const; 