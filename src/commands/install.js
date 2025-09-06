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
		configData.project.projectDir = config.projectDir;
		configData.project.backendDir = config.backendDir;
		configData.project.frontendDir = config.frontendDir;
		configData.docs.dir = config.docsDir;

		console.log(chalk.gray(`  Writing configuration...`));
		await writeJson(configPath, configData);

		// Create docs directory structure (use merged defaults)
		const docsDir = path.join(cwd, configData.docs.dir);
		await fs.ensureDir(docsDir);

		for (const subDir of Object.values(configData.docs.subdirs)) {
			await fs.ensureDir(path.join(docsDir, subDir));
		}

		// Write technical preferences from template in src/templates
		console.log(chalk.gray(`  Writing technical preferences...`));
		const templateTechPrefsPath = path.join(
			__dirname,
			"../templates/technical-preferences.md"
		);
		const techPrefsPath = path.join(docsDir, "technical-preferences.md");
		await fs.copy(templateTechPrefsPath, techPrefsPath);

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
		console.log(`   ├── planning/`);
		console.log(`   └── .gitignore`);
		console.log(`   ${configData.docs.dir}/`);
		console.log(`   ├── ${configData.docs.subdirs.epics}/`);
		console.log(`   ├── ${configData.docs.subdirs.stories}/`);
		console.log(`   ├── ${configData.docs.subdirs.qa}/`);
		console.log(`   ├── ${configData.docs.subdirs.brownfield}/`);
		console.log(`   └── technical-preferences.md`);

		console.log(
			chalk.gray(
				'\nRun "bmad-minimal update" to update files to the latest version.'
			)
		);

		if (config.generateTPPrompt) {
			// Suggest a ready-to-use prompt for an LLM/agent to help fill technical-preferences.md
			const tpDisplayPath = `${configData.docs.dir}/technical-preferences.md`;
			const contextLines = [`- Project name: ${config.projectName}`];
			if (configData.project.projectDir)
				contextLines.push(
					`- App directory: ${configData.project.projectDir}`
				);
			if (configData.project.backendDir)
				contextLines.push(
					`- Backend directory: ${configData.project.backendDir}`
				);
			if (configData.project.frontendDir)
				contextLines.push(
					`- Frontend directory: ${configData.project.frontendDir}`
				);
			contextLines.push(`- Docs directory: ${configData.docs.dir}`);
			const llmPrompt = `Task: Fill out ${tpDisplayPath} by replacing 'TBD' placeholders with concrete, project-appropriate choices.\n\nInstructions:\n- Inspect this workspace to infer languages/runtimes, package manager(s), frontend/backend libraries, testing tools, build tools, and high-level repo structure.\n- Prefer evidence from the repo (manifests, lockfiles, configs). If something is ambiguous or missing, use your domain knowledge to propose sensible defaults.\n- Modify only ${tpDisplayPath}. Do not add or reorder sections. Replace only the 'TBD' tokens (and any inline guidance comments) when you have a confident value; otherwise leave them as-is.\n\nContext:\n${contextLines.join(
				"\n"
			)}\n\nOutput: Provide either the edited markdown content of ${tpDisplayPath} or a unified diff that applies changes to that file only.`;

			console.log(
				"\n" + chalk.cyan("Prompt for your LLM/agent (copy/paste):")
			);
			console.log(llmPrompt + "\n");
		}
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
		projectDir: null,
		backendDir: null,
		frontendDir: null,
		baseDir: options.dir || ".bmad-minimal",
		docsDir: "docs",
	};

	// If not using defaults, prompt for configuration
	const answers = await inquirer.prompt([
		{
			type: "input",
			name: "projectName",
			message: "Project name:",
			default: path.basename(cwd),
			validate: (input) => input.trim() !== "" || "Project name is required",
			when: () => !config.projectName,
		},
		{
			type: "confirm",
			name: "isSingular",
			message:
				"Is this a singular app (fullstack app or an app with no clear backend/frontend separation)?",
		},
		{
			type: "input",
			name: "projectDir",
			message: "App directory (relative to current directory):",
			when: (answers) => answers.isSingular,
		},
		{
			type: "input",
			name: "backendDir",
			message: "Backend directory (relative to current directory):",
			when: (answers) => !answers.isSingular,
		},
		{
			type: "input",
			name: "frontendDir",
			message: "Frontend directory (relative to current directory):",
			when: (answers) => !answers.isSingular,
		},
		{
			type: "input",
			name: "baseDir",
			message: "Base directory for BMad files:",
			default: config.baseDir,
		},
		{
			type: "input",
			name: "docsDir",
			message: "Documentation directory:",
			default: config.docsDir,
		},
		{
			type: "confirm",
			name: "generateTPPrompt",
			message: "Generate technical preferences prompt?",
			default: true,
		},
	]);

	config.projectName = answers.projectName ?? config.projectName;
	config.projectDir = answers.projectDir?.trim() || null;
	config.backendDir = answers.backendDir?.trim() || null;
	config.frontendDir = answers.frontendDir?.trim() || null;
	config.baseDir = answers.baseDir;
	config.docsDir = answers.docsDir;
	config.generateTPPrompt = answers.generateTPPrompt;

	if (!config.projectName) {
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

	// Ensure at least one of projectDir, backendDir, or frontendDir is provided
	if (!config.projectDir && !config.backendDir && !config.frontendDir) {
		console.error(
			chalk.red(
				"❌ Installation aborted: provide at least one of App, Backend, or Frontend directory."
			)
		);
		throw new Error("No app/backend/frontend directory provided");
	}

	return config;
}

module.exports = install;
