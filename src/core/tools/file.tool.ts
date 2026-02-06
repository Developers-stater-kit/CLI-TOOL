import fs from "fs";
import path from "path";

export function createFolder(projectPath: string) {
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, { recursive: true });
  }
}

export function deleteFolder(folderPath: string) {
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }
  }
  

export function deleteFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function copyFile(src: string, dest: string) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

export function renameFile(oldPath: string, newPath: string) {
  fs.renameSync(oldPath, newPath);
}


export function emptyDirectory(dirPath: string) {
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
      const fullPath = path.join(dirPath, file);
      if (fs.lstatSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
          fs.unlinkSync(fullPath);
      }
  }
}


type FileMap = {
  source: string;
  destination: string;
  strategy: "copy" | "merge" | "overwrite";
  renameto: string;
};

export async function applyFileMap(
  steps: FileMap[],
  tempRoot: string,
  projectRoot: string
) {

  for (const step of steps) {

    const src = path.join(tempRoot, step.source);
    const dest = path.join(projectRoot, step.destination);

    // 1. COPY / OVERWRITE
    if (step.strategy === "copy" || step.strategy === "overwrite") {
      copyFile(src, dest);
    }

    // 2. MERGE (basic version for now)
    if (step.strategy === "merge") {
      const existing = fs.existsSync(dest)
        ? fs.readFileSync(dest, "utf-8")
        : "";

      const incoming = fs.readFileSync(src, "utf-8");

      fs.writeFileSync(dest, existing + "\n" + incoming);
    }

    // 3. RENAME AFTER COPY
    if (step.renameto) {
      const finalPath = path.join(
        path.dirname(dest),
        step.renameto
      );

      renameFile(dest, finalPath);
    }
  }
}
