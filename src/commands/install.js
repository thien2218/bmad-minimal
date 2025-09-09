const inquirer = require("inquirer");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs-extra");
const {
	copyDirectory,
	writeJson,
	exists,
	getCoreDir,
} = require("../utils/fileOperations");
const {
	getConfigFields,
	shouldGenerateCSPrompt,
} = require("../utils/configFields");

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

		// Copy engineering directory
		const engineeringSource = path.join(coreDir, "engineering");
		const engineeringDest = path.join(baseDir, "engineering");
		console.log(chalk.gray(`  Copying engineering files...`));
		await copyDirectory(engineeringSource, engineeringDest);

		// Copy planning directory
		const planningSource = path.join(coreDir, "planning");
		const planningDest = path.join(baseDir, "planning");
		console.log(chalk.gray(`  Copying planning files...`));
		await copyDirectory(planningSource, planningDest);

		// Write config.json
		const configPath = path.join(baseDir, "config.json");
		const defaultConfigPath = path.join(coreDir, "config.json");
		const configData = await fs.readJson(defaultConfigPath);

		// Merge defaults with gathered configuration
		configData.baseDir = config.baseDir;
		configData.project.name = config.projectName;
		configData.project.dir = config.dir ?? "";
		configData.project.backendDir = config.backendDir ?? "";
		configData.project.frontendDir = config.frontendDir ?? "";
		configData.project.testDirs = config.testDirs;
		configData.docs.dir = config.docsDir;

		console.log(chalk.gray(`  Writing configuration...`));
		await writeJson(configPath, configData);

		// Create docs directory structure (use merged defaults)
		const docsDir = path.join(cwd, configData.docs.dir);
		await fs.ensureDir(docsDir);

		for (const subDir of Object.values(configData.docs.subdirs)) {
			await fs.ensureDir(path.join(docsDir, subDir));
		}

		// After all files are written, ensure baseDir is ignored by git
		try {
			const gitignorePath = path.join(cwd, ".gitignore");
			let gitignoreContent = "";
			if (await exists(gitignorePath)) {
				gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
			}
			const entry = String(config.baseDir || "").trim();

			if (entry) {
				const lines = gitignoreContent
					.split(/\r?\n/)
					.map((l) => l.trim())
					.filter((l) => l.length > 0);
				const alreadyIgnored = lines.some(
					(line) => line === entry || line === `${entry}/`
				);
				if (!alreadyIgnored) {
					const needsNL =
						gitignoreContent.length > 0 &&
						!gitignoreContent.endsWith("\n");
					await fs.appendFile(
						gitignorePath,
						`${needsNL ? "\n" : ""}${entry}\n`
					);
					console.log(chalk.gray(`  Added "${entry}" to .gitignore`));
				}
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
