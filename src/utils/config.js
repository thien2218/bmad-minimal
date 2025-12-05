const path = require("path");
const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs-extra");
const { exists } = require("./fileOperations");
const { buildCodingStandardsPrompt } = require("./prompts");

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

/**
 * Build interactive prompts used to gather installation configuration.
 * This returns plain question objects consumable by inquirer.
 *
 * @param {string} cwd - Current working directory used for defaults.
 * @param {Object} [options]
 * @returns {Array<Object>} Inquirer-style question definitions.
 */
function getConfigFields(cwd, options) {
	return [
		{
			type: "input",
			name: "projectName",
			accessKey: "project.name",
			message: "Project name:",
			default: path.basename(cwd),
			validate: (input) => input.trim() !== "" || "Project name is required",
			when: () => !options?.project,
		},
		{
			type: "confirm",
			name: "isMonolithic",
			message:
				"Is this a monolithic app (everything happens in one place with no backend/frontend separation)?",
		},
		{
			type: "input",
			name: "dir",
			accessKey: "project.dir",
			message: "Monolithic app directory (relative to current directory):",
			default: () => "./",
			when: (answers) => answers.isMonolithic,
		},
		{
			type: "input",
			name: "frontendDir",
			accessKey: "project.frontendDir",
			message: "Frontend directory (relative to current directory):",
			default: () => "./frontend/",
			when: (answers) => !answers.isMonolithic,
		},
		{
			type: "input",
			name: "backendDir",
			accessKey: "project.backendDir",
			message: "Backend directory (relative to current directory):",
			default: () => "./backend/",
			when: (answers) => !answers.isMonolithic,
		},
		{
			type: "input",
			name: "testDirs",
			accessKey: "project.testDirs",
			message:
				"Test directories (comma-separated, relative to current directory):",
			default: "None",
			filter: (input) => {
				if (input.toLowerCase() === "none") {
					return [];
				}
				return input
					.split(",")
					.map((d) => d.trim())
					.filter((d) => d.length > 0);
			},
		},
		{
			type: "input",
			name: "baseDir",
			accessKey: "baseDir",
			message: "Base directory for BMad files:",
			default: options?.dir || "bmad-minimal",
		},
		{
			type: "input",
			name: "docsDir",
			accessKey: "docs.dir",
			message: "Documentation directory:",
			default: "docs",
		},
	];
}

/**
 * Optionally create coding-standards.md from a template and display
 * a ready-to-use LLM prompt to complete it.
 *
 * @param {object} configData - The merged configuration data that will be written to config.json
 * @returns {Promise<void>}
 */
async function shouldGenerateCSPrompt(configData) {
	const codingStdsPath = path.join(configData.docs.dir, "coding-standards.md");

	// Write coding standards from template if file doesn't exist
	if (!(await exists(codingStdsPath))) {
		console.log(chalk.gray("  Writing coding standards template..."));
		const templateTechPrefsPath = path.join(
			__dirname,
			"../templates/coding-standards.md"
		);
		await fs.copy(templateTechPrefsPath, codingStdsPath);

		const { generateCSPrompt } = await inquirer.prompt([
			{
				type: "confirm",
				name: "generateCSPrompt",
				message: "Generate coding standards prompt?",
				default: true,
			},
		]);

		if (generateCSPrompt) {
			// Ready-to-use prompt for an LLM/agent to help fill coding-preferences.md (coding standards)
			const llmPrompt = buildCodingStandardsPrompt({
				projectName: configData.project.name,
				docsDir: configData.docs.dir,
				projectDir: configData.project.dir,
				backendDir: configData.project.backendDir,
				frontendDir: configData.project.frontendDir,
			});

			console.log(
				"\n" + chalk.cyan("Prompt for your LLM/agent (copy/paste):")
			);
			console.log(llmPrompt + "\n");
		}
	}
}

module.exports = {
	findConfig,
	loadDefaultConfig,
	mergeConfig,
	ensureDocsDefaults,
	getConfigFields,
	shouldGenerateCSPrompt,
};
