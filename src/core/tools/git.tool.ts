import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function cloneRepo(repoName: string, projectPath: string) {
  const repoUrl = `https://github.com/Developers-stater-kit/${repoName}.git`;

  await execAsync(`git clone ${repoUrl} ${projectPath}`);
}

export async function checkoutBranch(projectPath: string, branch: string) {
  await execAsync(`git checkout ${branch}`, { cwd: projectPath });
}

export async function removeGit(projectPath: string) {
  await execAsync(`rm -rf .git`, { cwd: projectPath });
}
