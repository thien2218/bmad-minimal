const inquirer = require("inquirer");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs-extra");
const { writeJson, exists, getCoreDir } = require("../utils/fileOperations");
const { ensureIgnored } = require("../lib/gitignore");
const {
	getConfigFields,
	shouldGenerateCSPrompt,
} = require("../utils/configFields");
const {
	copyCoreDirectories,
	ensureDocsStructure,
} = require("../services/docsService");
const { loadDefaultConfig, mergeConfig } = require("../services/configService");

/**
 * Install BMad Minimal into the current workspace.
 * - Prompts for configuration
 * - Copies core templates
 * - Writes config.json
 * - Ensures docs structure and updates .gitignore
 *
 * @param {Object} options - CLI options parsed upstream.
 * @returns {Promise<void>}
 */
async function install(options) {
	console.log(chalk.blue("🚀 BMad Minimal Installation\n"));

	const cwd = process.cwd();
	const coreDir = getCoreDir();

	// Check if already installed
	const existingConfigs = await findExistingConfigs(cwd);
	if (existingConfigs.length > 0) {
		console.log(
			chalk.yellow("⚠️ BMad Minimal configuration already exists:")
		);
		existingConfigs.forEach((config) => console.log(`   - ${config}`));

		const { proceed } = await inquirer.prompt([
			{
				type: "confirm",
				name: "proceed",
				message: "Do you want to overwrite the existing configuration?",
				default: false,
			},
		]);

		if (!proceed) {
			console.log(chalk.gray("Installation cancelled."));
			return;
		}
	}

	// Gather configuration
	const config = await gatherConfiguration(options, cwd);

	console.log(chalk.blue("\n📦 Installing BMad Minimal files...\n"));

	try {
		// Create base directory structure
		const baseDir = path.join(cwd, config.baseDir);
		await fs.ensureDir(baseDir);

		// Copy core directories
		console.log(chalk.gray(`  Copying engineering and planning files...`));
		await copyCoreDirectories(coreDir, baseDir);

		// Write config.json
		const configPath = path.join(baseDir, "config.json");
		// Load defaults and merge with gathered configuration
		const defaultConfig = await loadDefaultConfig(coreDir);
		const configData = mergeConfig(defaultConfig, config);

		console.log(chalk.gray(`  Writing configuration...`));
		await writeJson(configPath, configData);

		// Create docs directory structure (use merged defaults)
		await ensureDocsStructure(cwd, configData);

		// After all files are written, ensure baseDir is ignored by git
		try {
			const entry = String(config.baseDir || "").trim();
			const modified = await ensureIgnored({ cwd, entry });
			if (entry) {
				console.log(
					chalk.gray(
						modified
							? `  Added "${entry}" to .gitignore`
							: `  .gitignore already includes "${entry}"`
					)
				);
			}
		} catch (e) {
			console.log(
				chalk.yellow(`  Warning: failed to update .gitignore: ${e.message}`)
			);
		}

		console.log(chalk.green("\n✅ BMad Minimal installation complete!\n"));
		console.log(chalk.cyan("📁 Structure created:"));
		console.log(`   ${config.baseDir}/`);
		console.log(`   ├── config.json`);
		console.log(`   ├── engineering/`);
		console.log(`   └── planning/`);
		console.log(`   ${configData.docs.dir}/`);
		console.log(`   ├── ${configData.docs.subdirs.epics}/`);
		console.log(`   ├── ${configData.docs.subdirs.stories}/`);
		console.log(`   ├── ${configData.docs.subdirs.qa}/`);
		console.log(`   ├── ${configData.docs.subdirs.brownfield}/`);
		console.log(`   └── coding-standards.md`);

		await shouldGenerateCSPrompt(configData);
	} catch (error) {
		console.error(chalk.red("❌ Installation failed:"), error.message);
		throw error;
	}
}

async function findExistingConfigs(cwd) {
	const configs = [];
	const possibleDirs = ["bmad-minimal"];

	for (const dir of possibleDirs) {
		const configPath = path.join(cwd, dir, "config.json");
		if (await exists(configPath)) {
			configs.push(`${dir}/config.json`);
		}
	}

	return configs;
}

async function gatherConfiguration(options, cwd) {
	const answers = await inquirer.prompt(getConfigFields(cwd, options));

	if (!answers.projectName) {
		const { projectName } = await inquirer.prompt([
			{
				type: "input",
				name: "projectName",
				message: "Project name:",
				default: path.basename(cwd),
				validate: (input) =>
					input.trim() !== "" || "Project name is required",
			},
		]);
		answers.projectName = projectName;
	}

	// Ensure at least one of dir, backendDir, or frontendDir is provided
	if (!answers.dir && !answers.backendDir && !answers.frontendDir) {
		console.error(
			chalk.red(
				"❌ Installation aborted: provide at least one of App, Backend, or Frontend directory."
			)
		);
		throw new Error("No app/backend/frontend directory provided");
	}

	return answers;
}

module.exports = install;
