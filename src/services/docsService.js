const fs = require("fs-extra");
const path = require("path");
const {
	getPrdDirectory,
	normalizePrdSlug,
	ensurePrdFilename,
} = require("../utils/prdSlugUtils");

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
 * Create a PRD file name from a slug and ensure the directory exists.
 * @param {string} prdDir
 * @param {string} slug
 * @returns {Promise<string>} absolute path to the PRD file
 */
async function resolvePrdPath(prdDir, slug) {
	const normalizedSlug = normalizePrdSlug(slug);
	const filename = ensurePrdFilename(normalizedSlug);
	await fs.ensureDir(prdDir);
	return path.join(prdDir, filename);
}

/**
 * Detect legacy docs/prd.md file.
 * @param {string} docsDir
 * @returns {Promise<string|null>}
 */
async function detectLegacyPrd(docsDir) {
	const legacyPath = path.join(docsDir, "prd.md");
	const exists = await fs.pathExists(legacyPath);
	return exists ? legacyPath : null;
}

module.exports = {
	copyCoreDirectories,
	ensureDocsStructure,
	resolvePrdPath,
	detectLegacyPrd,
	getPrdDirectory,
};
