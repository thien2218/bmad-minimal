import fs from "fs-extra";
import path from "path";
import { getPath } from "./fileOperations";
import type { BmadConfig } from "./config";

export async function copyCoreDirectories(
	coreDir: string,
	baseDir: string
): Promise<void> {
	const engineeringSource = path.join(coreDir, "engineering");
	const engineeringDest = path.join(baseDir, "engineering");
	await fs.copy(engineeringSource, engineeringDest, { overwrite: true });

	const planningSource = path.join(coreDir, "planning");
	const planningDest = path.join(baseDir, "planning");
	await fs.copy(planningSource, planningDest, { overwrite: true });
}

export async function ensureDocsStructure(
	cwd: string,
	configData: BmadConfig
): Promise<void> {
	const docsDir = path.join(cwd, configData.docs.dir);
	await fs.ensureDir(docsDir);
	for (const subDir of Object.values(configData.docs.subdirs)) {
		await fs.ensureDir(path.join(docsDir, subDir));
	}
}

export async function copyCheatSheetToWorkspace(
	cwd: string,
	configData: BmadConfig
): Promise<void> {
	const packageCheatSheetPath = getPath("docs/cheat-sheet.md");
	const workspaceCheatSheetPath = path.join(
		cwd,
		configData.docs.dir,
		"cheat-sheet.md"
	);

	if (!(await fs.pathExists(packageCheatSheetPath))) {
		return;
	}

	await fs.ensureDir(path.dirname(workspaceCheatSheetPath));
	await fs.copy(packageCheatSheetPath, workspaceCheatSheetPath, {
		overwrite: true,
	});
}
