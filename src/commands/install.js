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
const { getConfigFields } = require("../utils/configFields");

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
		configData.project.testDirs = Array.isArray(config.testDirs)
			? config.testDirs
			: [];
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

	// Ensure at least one of projectDir, backendDir, or frontendDir is provided
	if (!answers.projectDir && !answers.backendDir && !answers.frontendDir) {
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
