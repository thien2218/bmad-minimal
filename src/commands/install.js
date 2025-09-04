const inquirer = require("inquirer");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs-extra");
const {
	copyDirectory,
	writeJson,
	exists,
	getCoreDir,
	ensureDir,
} = require("../utils/fileOperations");
const {
	detectLanguages,
	getProjectMetadata,
} = require("../utils/metadataExtractor");
const {
	generateTechnicalPreferences,
} = require("../utils/techPreferencesGenerator");

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
		await ensureDir(baseDir);

		// Copy engineering directory
		const engineeringSource = path.join(coreDir, "engineering");
		const engineeringDest = path.join(baseDir, "engineering");
		console.log(chalk.gray(`  Copying engineering files...`));
		await copyDirectory(engineeringSource, engineeringDest);

		// Copy planning directory if requested
		if (config.includePlanning) {
			const planningSource = path.join(coreDir, "planning");
			const planningDest = path.join(baseDir, "planning");
			console.log(chalk.gray(`  Copying planning files...`));
			await copyDirectory(planningSource, planningDest);
		}

		// Write config.json
		const configPath = path.join(baseDir, "config.json");
		const configData = {
			projectName: config.projectName,
			backendDir: config.backendDir,
			frontendDir: config.frontendDir,
			baseDir: config.baseDir,
			customTechnicalDocuments: null,
			docs: {
				dir: config.docs.dir,
				subDirs: {
					qa: config.docs.subDirs.qa || "qa",
					epics: config.docs.subDirs.epics || "epics",
					stories: config.docs.subDirs.stories || "stories",
					changelog: config.docs.subDirs.changelog || "changelog",
				},
				files: {
					prd: "prd.md",
					feSpec: "frontend-spec.md",
					feArchitecture: "frontend-architecture.md",
					beArchitecture: "backend-architecture.md",
					fsArchitecture: "fullstack-architecture.md",
					technicalPreferences: "technical-preferences.md",
				},
			},
		};
		console.log(chalk.gray(`  Writing configuration...`));
		await writeJson(configPath, configData);

		// Create docs directory structure
		const docsDir = path.join(cwd, config.docs.dir);
		await ensureDir(docsDir);

		for (const subDir of Object.values(config.docs.subDirs)) {
			await ensureDir(path.join(docsDir, subDir));
		}

		// Generate and write technical preferences
		console.log(chalk.gray(`  Generating technical preferences...`));
		const backendPath = config.backendDir && path.resolve(cwd, config.backendDir);
		const frontendPath = config.frontendDir && path.resolve(cwd, config.frontendDir);

		// Detect languages and collect metadata from both backend and frontend directories
		const backendLangs = await detectLanguages(backendPath);
		const frontendLangs = await detectLanguages(frontendPath);
		const languages = Array.from(new Set([...backendLangs, ...frontendLangs]));

		const backendMeta = await getProjectMetadata(backendPath, backendLangs);
		const frontendMeta = await getProjectMetadata(frontendPath, frontendLangs);

		const metadata = {
			languages,
			libraries: {
        backend: backendMeta.libraries,
        frontend: frontendMeta.libraries,
      },
			testFrameworks: Array.from(new Set([...backendMeta.testFrameworks, ...frontendMeta.testFrameworks])),
			buildTools: Array.from(new Set([...backendMeta.buildTools, ...frontendMeta.buildTools])),
			packageManager: backendMeta.packageManager || frontendMeta.packageManager || null,
		};

		const techPrefsContent = await generateTechnicalPreferences(metadata);

		const techPrefsPath = path.join(docsDir, "technical-preferences.md");
		await fs.writeFile(techPrefsPath, techPrefsContent);

		// Create .gitignore for bmad directory if it doesn't exist
		const gitignorePath = path.join(baseDir, ".gitignore");
		if (!(await exists(gitignorePath))) {
			await fs.writeFile(
				gitignorePath,
				"# BMad Minimal temporary files\\n*.tmp\\n*.log\\n"
			);
		}

		console.log(chalk.green("\n✅ BMad Minimal installation complete!\n"));
		console.log(chalk.cyan("📁 Structure created:"));
		console.log(`   ${config.baseDir}/`);
		console.log(`   ├── config.json`);
		console.log(`   ├── engineering/`);
		if (config.includePlanning) {
			console.log(`   ├── planning/`);
		}
		console.log(`   └── .gitignore`);
		console.log(`   ${config.docs.dir}/`);
		console.log(`   ├── ${config.docs.subDirs.epics}/`);
		console.log(`   ├── ${config.docs.subDirs.stories}/`);
		console.log(`   ├── ${config.docs.subDirs.qa}/`);
		console.log(`   ├── ${config.docs.subDirs.changelog}/`);
		console.log(`   └── technical-preferences.md`);

		if (languages.length > 0) {
			console.log(
				chalk.cyan("\n🔍 Detected languages:"),
				languages.join(", ")
			);
			if (metadata.libraries && metadata.libraries.length > 0) {
				console.log(
					chalk.cyan("📚 Detected libraries:"),
					metadata.libraries.length,
					"packages"
				);
				// Show first few major libraries if any
				const majorLibs = metadata.libraries
					.filter((lib) =>
						[
							"react",
							"vue",
							"angular",
							"express",
							"django",
							"flask",
							"rails",
						].some((major) => lib.toLowerCase().includes(major))
					)
					.slice(0, 5);
				if (majorLibs.length > 0) {
					console.log(chalk.gray("   Including:"), majorLibs.join(", "));
				}
			}
		}

		console.log(
			chalk.gray(
				'\\nRun "bmad-minimal update" to update files to the latest version.'
			)
		);
	} catch (error) {
		console.error(chalk.red("❌ Installation failed:"), error.message);
		throw error;
	}
}

async function findExistingConfigs(cwd) {
	const configs = [];
	const possibleDirs = [".bmad-minimal"];

	for (const dir of possibleDirs) {
		const configPath = path.join(cwd, dir, "config.json");
		if (await exists(configPath)) {
			configs.push(`${dir}/config.json`);
		}
	}

	return configs;
}

async function gatherConfiguration(options, cwd) {
	const config = {
		projectName: options.project,
		backendDir: null,
		frontendDir: null,
		baseDir: options.dir || ".bmad-minimal",
		includePlanning: true,
		docs: {
			dir: "docs",
			subDirs: {
				epics: "epics",
				stories: "stories",
				qa: "qa",
				changelog: "changelog",
			},
		},
	};

	// If not using defaults, prompt for configuration
	if (!options.yes) {
		const answers = await inquirer.prompt([
			{
				type: "input",
				name: "projectName",
				message: "Project name:",
				default: config.projectName || path.basename(cwd),
				validate: (input) =>
					input.trim() !== "" || "Project name is required",
				when: () => !config.projectName,
			},
			{
				type: "input",
				name: "backendDir",
				message: "Backend directory (relative to current directory):",
			},
			{
				type: "input",
				name: "frontendDir",
				message: "Frontend directory (relative to current directory):",
			},
			{
				type: "input",
				name: "baseDir",
				message: "Base directory for BMad files:",
				default: config.baseDir,
			},
			{
				type: "confirm",
				name: "includePlanning",
				message: "Include planning templates?",
				default: config.includePlanning,
			},
			{
				type: "input",
				name: "docsDir",
				message: "Documentation directory:",
				default: config.docs.dir,
			},
		]);

		config.projectName = answers.projectName ?? config.projectName;
		config.backendDir = answers.backendDir.trim() !== "" ? answers.backendDir.trim() : null;
		config.frontendDir = answers.frontendDir.trim() !== "" ? answers.frontendDir.trim() : null;
		config.baseDir = answers.baseDir;
		config.includePlanning = answers.includePlanning;
		config.docs.dir = answers.docsDir;
	} else if (!config.projectName) {
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
		config.projectName = projectName;
	}

	return config;
}

module.exports = install;
