const fs = require("fs-extra");
const path = require("path");

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
 * Copy pre-compressed agent JSON files from
 *   compressed/engineering -> <baseDir>/engineering/agents
 *   compressed/planning    -> <baseDir>/planning/agents
 *
 * @param {string} baseDir - Absolute path to the target base directory in the workspace
 * @returns {Promise<void>}
 */
async function copyCompressedAgents(baseDir) {
	const categories = ["engineering", "planning"];

	for (const category of categories) {
		const compressedDir = path.join(__dirname, "../../compressed", category);
		const agentsDir = path.join(baseDir, category, "agents");

		if (!(await fs.pathExists(compressedDir))) {
			continue;
		}

		await fs.ensureDir(agentsDir);

		const entries = await fs.readdir(compressedDir);
		for (const name of entries) {
			const sourcePath = path.join(compressedDir, name);
			const destPath = path.join(agentsDir, name);
			const stat = await fs.stat(sourcePath);
			if (stat.isFile()) {
				await fs.copy(sourcePath, destPath, { overwrite: true });
			}
		}
	}
}

module.exports = {
	copyCoreDirectories,
	ensureDocsStructure,
	copyCompressedAgents,
};
