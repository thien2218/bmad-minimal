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
			project: {
				name: config.projectName,
				appDir: config.appDir,
				backendDir: config.backendDir,
				frontendDir: config.frontendDir,
			},
			baseDir: config.baseDir,
			customTechnicalDocuments: null,
			docs: {
				dir: config.docs.dir,
				subdirs: {
					qa: config.docs.subdirs.qa || "qa",
					epics: config.docs.subdirs.epics || "epics",
					stories: config.docs.subdirs.stories || "stories",
					changelog: config.docs.subdirs.changelog || "changelog",
				},
				files: {
					prd: "prd.md",
					feSpec: "frontend-spec.md",
					feArchitecture: "frontend-architecture.md",
					beArchitecture: "backend-architecture.md",
					architecture: "fullstack-architecture.md",
					technicalPreferences: "technical-preferences.md",
				},
			},
		};
		console.log(chalk.gray(`  Writing configuration...`));
		await writeJson(configPath, configData);

		// Create docs directory structure
		const docsDir = path.join(cwd, config.docs.dir);
		await ensureDir(docsDir);

		for (const subDir of Object.values(config.docs.subdirs)) {
			await ensureDir(path.join(docsDir, subDir));
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
		if (config.includePlanning) {
			console.log(`   ├── planning/`);
		}
		console.log(`   └── .gitignore`);
		console.log(`   ${config.docs.dir}/`);
		console.log(`   ├── ${config.docs.subdirs.epics}/`);
		console.log(`   ├── ${config.docs.subdirs.stories}/`);
		console.log(`   ├── ${config.docs.subdirs.qa}/`);
		console.log(`   ├── ${config.docs.subdirs.changelog}/`);
		console.log(`   └── technical-preferences.md`);

		console.log(
			chalk.gray(
				'\nRun "bmad-minimal update" to update files to the latest version.'
			)
		);

		if (config.generateTPPrompt) {
			// Suggest a ready-to-use prompt for an LLM/agent to help fill technical-preferences.md
			const tpDisplayPath = `${config.docs.dir}/technical-preferences.md`;
			const contextLines = [`- Project name: ${config.projectName}`];
			if (config.appDir)
				contextLines.push(`- App directory: ${config.appDir}`);
			if (config.backendDir)
				contextLines.push(`- Backend directory: ${config.backendDir}`);
			if (config.frontendDir)
				contextLines.push(`- Frontend directory: ${config.frontendDir}`);
			contextLines.push(`- Docs directory: ${config.docs.dir}`);
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
		appDir: null,
		backendDir: null,
		frontendDir: null,
		baseDir: options.dir || ".bmad-minimal",
		includePlanning: true,
		docs: {
			dir: "docs",
			subdirs: {
				epics: "epics",
				stories: "stories",
				qa: "qa",
				changelog: "changelog",
			},
		},
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
			name: "appDir",
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
		{
			type: "confirm",
			name: "generateTPPrompt",
			message: "Generate technical preferences prompt?",
			default: true,
		},
	]);

	config.projectName = answers.projectName ?? config.projectName;
	config.appDir = answers.appDir?.trim() || null;
	config.backendDir = answers.backendDir?.trim() || null;
	config.frontendDir = answers.frontendDir?.trim() || null;
	config.baseDir = answers.baseDir;
	config.includePlanning = answers.includePlanning;
	config.docs.dir = answers.docsDir;
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

	// Ensure at least one of appDir, backendDir, or frontendDir is provided
	if (!config.appDir && !config.backendDir && !config.frontendDir) {
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
