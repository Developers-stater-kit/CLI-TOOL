import fs from "fs";
import path from "path";

const comment = `# Add values for below env variables from concerned services/tools
# Then create .env file and run the project

`

export function createEnvExample(projectPath: string, envVars: string[]) {
    const filePath = path.join(projectPath, ".env.example");

    const uniqueVars = [...new Set(envVars)];

    const content = comment + uniqueVars.map(v => `${v}=  your ${v.toLowerCase().replace(/_/g, " ")}`
    ).join("\n");

    fs.writeFileSync(filePath, content, "utf-8");
}
