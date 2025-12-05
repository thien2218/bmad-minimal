const fs = require("fs-extra");
const path = require("path");
const { getPath } = require("./fileOperations");

/**
 * Copy core directories (engineering, planning) into a base directory.
 * Does not remove existing content; callers decide overwrite/cleanup policy.
 *
 * @param {string} coreDir - Absolute path to core/
 * @param {string} baseDir - Absolute path to target base directory
 * @returns {Promise<void>}
 */
async function copyCoreDirectories(coreDir, baseDir) {
	const engineeringSource = path.join(coreDir, "engineering");
	const engineeringDest = path.join(baseDir, "engineering");
	await fs.copy(engineeringSource, engineeringDest, { overwrite: true });

	const planningSource = path.join(coreDir, "planning");
	const planningDest = path.join(baseDir, "planning");
	await fs.copy(planningSource, planningDest, { overwrite: true });
}

/**
 * Ensure documentation directory and its subdirectories from config exist.
 * @param {string} cwd - Current working directory
 * @param {object} configData - The merged configuration data with docs.dir and docs.subdirs
 * @returns {Promise<void>}
 */
async function ensureDocsStructure(cwd, configData) {
	const docsDir = path.join(cwd, configData.docs.dir);
	await fs.ensureDir(docsDir);
	for (const subDir of Object.values(configData.docs.subdirs)) {
		await fs.ensureDir(path.join(docsDir, subDir));
	}
}

/**
 * Copy the package cheat sheet (docs/cheat-sheet.md in this package)
 * into the workspace docs directory next to coding-standards.md.
 *
 * @param {string} cwd - Current working directory (workspace root)
 * @param {object} configData - Config object with docs.dir
 * @returns {Promise<void>}
 */
async function copyCheatSheetToWorkspace(cwd, configData) {
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

module.exports = {
	copyCoreDirectories,
	ensureDocsStructure,
	copyCheatSheetToWorkspace,
};
