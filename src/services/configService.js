const fs = require("fs-extra");
const path = require("path");

/**
 * Locate an existing BMAD configuration file under common directories.
 * @param {string} cwd - Current working directory
 * @returns {Promise<{dir: string, path: string}|null>} The found directory and path or null
 */
async function findConfig(cwd) {
	const possibleDirs = ["bmad-minimal", ".bmad", "bmad"];
	for (const dir of possibleDirs) {
		const configPath = path.join(cwd, dir, "config.json");
		try {
			await fs.access(configPath);
			return { dir, path: configPath };
		} catch {}
	}
	return null;
}

/**
 * Load the default config.json bundled under core/.
 * @param {string} coreDir - Absolute path to core directory
 * @returns {Promise<object>} default config object
 */
async function loadDefaultConfig(coreDir) {
	const defaultConfigPath = path.join(coreDir, "config.json");
	return fs.readJson(defaultConfigPath);
}

/**
 * Merge installation answers into the default config structure.
 * @param {object} defaultConfig
 * @param {object} answers - Gathered answers from prompts
 * @returns {object} merged config
 */
function mergeConfig(defaultConfig, answers) {
	const cfg = { ...defaultConfig };
	cfg.baseDir = answers.baseDir;
	cfg.project = cfg.project || {};
	cfg.project.name = answers.projectName;
	cfg.project.dir = answers.dir ?? "";
	cfg.project.backendDir = answers.backendDir ?? "";
	cfg.project.frontendDir = answers.frontendDir ?? "";
	cfg.project.testDirs = Array.isArray(answers.testDirs)
		? answers.testDirs
		: [];
	cfg.docs = cfg.docs || {};
	cfg.docs.dir = answers.docsDir;
	return cfg;
}

module.exports = {
	findConfig,
	loadDefaultConfig,
	mergeConfig,
};
