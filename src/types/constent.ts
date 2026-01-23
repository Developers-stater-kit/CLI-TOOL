export type AppType = "web" | "mobile"
export type DBType = "sql" | "no-sql"
export type AuthMethod = "email" | "social" | "otp" | "custom";
export type SocialProvider = "google" | "github" | "apple" | "custom";
export type SetupUpto = "framework" | "auth" | "database" | "payments";

export interface CliState {
  projectName?: string;
  appType?: AppType;
  framework?: string;
  setupUpto?: SetupUpto;

  authLib?: string;
  authMethods?: AuthMethod[];
  socialProviders?: SocialProvider[];

  dbType?: DBType;
  dbProvider?: string;
  orm?: string;
  paymentProvider?: string;
}