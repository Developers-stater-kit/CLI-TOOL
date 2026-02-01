import { startLoading, succeed, fail } from "../components/loader";
import path from "path";
import fs from "fs";

type MergeRepo = {
  repoName: string;
  type: string;
  meta: any;
};

export async function mergeFeatureRepo(
  projectPath: string,
  tempRepoPath: string,
  featureRepo: MergeRepo
) {
  try {
    startLoading(`Merging ${featureRepo.type}: ${featureRepo.repoName}...`);

    const devkitConfig = featureRepo.meta;

    // 1️⃣ Inject code at anchors
    if (devkitConfig.anchors) {
      for (const [anchorKey, anchorConfig] of Object.entries(devkitConfig.anchors)) {
        await injectCodeAtAnchor(
          projectPath,
          tempRepoPath,
          anchorConfig as any
        );
      }
    }

    // 2️⃣ Merge dependencies
    if (devkitConfig.dependencies) {
      mergeDependencies(projectPath, devkitConfig.dependencies);
    }

    // 3️⃣ Merge env vars
    if (devkitConfig.envVars) {
      mergeEnvVars(projectPath, devkitConfig.envVars);
    }

    succeed(`${featureRepo.type} merged successfully`);
  } catch (error: any) {
    fail(`Merge failed for ${featureRepo.repoName}: ${error.message}`);
    throw error;
  }
}

async function injectCodeAtAnchor(
  projectPath: string,
  tempRepoPath: string,
  anchorConfig: {
    file: string;
    marker: string;
  }
) {
  try {
    const targetFile = path.join(projectPath, anchorConfig.file);
    
    if (!fs.existsSync(targetFile)) {
      throw new Error(`Target file not found: ${anchorConfig.file}`);
    }

    let content = fs.readFileSync(targetFile, "utf8");

    // Check if anchor exists
    if (!content.includes(anchorConfig.marker)) {
      throw new Error(`Anchor not found: ${anchorConfig.marker}`);
    }

    // TODO: Extract code from temp repo and inject at marker
    // For now, just mark location
    console.log(`  ✓ Anchor found: ${anchorConfig.marker}`);
  } catch (error: any) {
    throw new Error(`Anchor injection failed: ${error.message}`);
  }
}

function mergeDependencies(projectPath: string, newDeps: Record<string, string>) {
  try {
    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...newDeps,
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`  ✓ Dependencies merged`);
  } catch (error: any) {
    throw new Error(`Dependency merge failed: ${error.message}`);
  }
}

function mergeEnvVars(projectPath: string, newEnvVars: string[]) {
  try {
    const envPath = path.join(projectPath, ".env.example");
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

    const existingVars = new Set(envContent.split("\n").filter(Boolean));

    newEnvVars.forEach((envVar) => {
      if (!existingVars.has(envVar)) {
        envContent += `\n${envVar}=`;
      }
    });

    fs.writeFileSync(envPath, envContent.trim());
    console.log(`  ✓ Environment variables merged`);
  } catch (error: any) {
    throw new Error(`EnvVar merge failed: ${error.message}`);
  }
}