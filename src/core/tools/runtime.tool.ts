import { promisify } from "util";
import { exec, spawn } from "child_process"; // Add spawn

const execAsync = promisify(exec);

export async function runCommand(command: string, cwd?: string) {
  return execAsync(command, {
    cwd,
    env: { ...process.env, PATH: process.env.PATH }
  });
}

export async function installPackages(pm: string, projectPath: string) {
  await runCommand(`${pm} install`, projectPath);
}



// Keep your existing execAsync for background tasks

export async function runInteractiveCommand(command: string, cwd?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(" ");
    const child = spawn(cmd, args, {
      cwd,
      stdio: "inherit", // This links the CLI to your terminal for input/output
      shell: true
    });

    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}