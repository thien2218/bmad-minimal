const fs = require("fs-extra");
const path = require("path");

const DEFAULT_DOCS_CONFIG = {
	dir: "docs",
	subdirs: {
		qa: "qa",
		epics: "epics",
		stories: "stories",
	},
};

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
	const config = await fs.readJson(defaultConfigPath);
	return ensureDocsDefaults(config);
}

/**
 * Merge installation answers into the default config structure.
 * @param {object} defaultConfig
 * @param {object} answers - Gathered answers from prompts
 * @returns {object} merged config
 */
function mergeConfig(defaultConfig, answers) {
	const cfg = JSON.parse(JSON.stringify(defaultConfig));
	ensureDocsDefaults(cfg);

	if (answers.baseDir) cfg.baseDir = answers.baseDir;

	cfg.project = cfg.project || {};
	if (answers.projectName) cfg.project.name = answers.projectName;
	if (answers.dir !== undefined) cfg.project.dir = answers.dir ?? "";
	if (answers.backendDir !== undefined)
		cfg.project.backendDir = answers.backendDir ?? "";
	if (answers.frontendDir !== undefined)
		cfg.project.frontendDir = answers.frontendDir ?? "";
	if (Array.isArray(answers.testDirs)) {
		cfg.project.testDirs = answers.testDirs;
	}

	if (!cfg.docs) cfg.docs = {};
	if (answers.docsDir) cfg.docs.dir = answers.docsDir;

	return ensureDocsDefaults(cfg);
}

function ensureDocsDefaults(config) {
	if (!config || typeof config !== "object") return config;

	if (!config.docs || typeof config.docs !== "object") {
		config.docs = {};
	}

	if (!config.docs.dir || typeof config.docs.dir !== "string") {
		config.docs.dir = DEFAULT_DOCS_CONFIG.dir;
	} else {
		config.docs.dir = config.docs.dir.trim() || DEFAULT_DOCS_CONFIG.dir;
	}

	if (!config.docs.subdirs || typeof config.docs.subdirs !== "object") {
		config.docs.subdirs = { ...DEFAULT_DOCS_CONFIG.subdirs };
	} else {
		for (const [key, value] of Object.entries(DEFAULT_DOCS_CONFIG.subdirs)) {
			if (
				!config.docs.subdirs[key] ||
				typeof config.docs.subdirs[key] !== "string" ||
				config.docs.subdirs[key].trim() === ""
			) {
				config.docs.subdirs[key] = value;
			} else {
				config.docs.subdirs[key] = config.docs.subdirs[key].trim();
			}
		}
	}

	return config;
}

module.exports = {
	findConfig,
	loadDefaultConfig,
	mergeConfig,
	ensureDocsDefaults,
};
