import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import fs from "fs-extra";
import { writeJson, exists, getPath } from "../utils/fileOperations";
import { ensureIgnored } from "../utils/gitignore";
import {
	getConfigFields,
	shouldGenerateCSPrompt,
	loadDefaultConfig,
	mergeConfig,
	ConfigAnswers,
} from "../utils/config";
import {
	copyCoreDirectories,
	ensureDocsStructure,
	copyCheatSheetToWorkspace,
} from "../utils/docs";
import { compressAgentConfigs } from "../utils/compress";

export interface InstallCommandOptions {
	project?: string;
	dir?: string;
}

export async function install(
	options: InstallCommandOptions = {}
): Promise<void> {
	console.log(chalk.blue("🚀 BMad Minimal Installation\n"));
	const cwd = process.cwd();
	const coreDir = getPath("core");
	const existingConfigs = await findExistingConfigs(cwd);

	if (existingConfigs.length > 0) {
		console.log(chalk.yellow("⚠️ BMad Minimal configuration already exists:"));
		existingConfigs.forEach((config) => console.log(`   - ${config}`));
		const { proceed } = await inquirer.prompt<{ proceed: boolean }>([
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

	const configAnswers = await gatherConfiguration(options, cwd);
	console.log(chalk.blue("\n📦 Installing BMad Minimal files...\n"));

	try {
		const baseDir = path.join(cwd, configAnswers.baseDir ?? "bmad-minimal");
		await fs.ensureDir(baseDir);
		console.log(chalk.gray("  Copying engineering and planning files..."));
		await copyCoreDirectories(coreDir, baseDir);
		console.log(chalk.gray("  Compressing agent configurations..."));
		await compressAgentConfigs(baseDir);
		const configPath = path.join(baseDir, "config.json");
		const defaultConfig = await loadDefaultConfig(coreDir);
		const configData = mergeConfig(defaultConfig, configAnswers);
		console.log(chalk.gray("  Writing configuration..."));
		await writeJson(configPath, configData);
		await ensureDocsStructure(cwd, configData);

		try {
			await copyCheatSheetToWorkspace(cwd, configData);
			console.log(
				chalk.gray(
					`  Copied cheat sheet to ${configData.docs.dir}/cheat-sheet.md`
				)
			);
		} catch (error) {
			console.log(
				chalk.yellow(
					`  Warning: failed to copy cheat sheet: ${(error as Error).message}`
				)
			);
		}

		try {
			const entry = String(configAnswers.baseDir ?? "").trim();
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
		} catch (error) {
			console.log(
				chalk.yellow(
					`  Warning: failed to update .gitignore: ${(error as Error).message}`
				)
			);
		}

		await shouldGenerateCSPrompt(configData);
		console.log(chalk.green("\n✅ BMad Minimal installation complete!\n"));
		console.log(chalk.cyan("📁 Structure created:"));
		console.log(`   ${configAnswers.baseDir ?? "bmad-minimal"}/`);
		console.log("   ├── config.json");
		console.log("   ├── engineering/");
		console.log("   └── planning/");
		console.log(`   ${configData.docs.dir}/`);
		console.log(`   ├── ${configData.docs.subdirs.epics}/`);
		console.log(`   ├── ${configData.docs.subdirs.stories}/`);
		console.log(`   ├── ${configData.docs.subdirs.qa}/`);
		console.log(`   ├── ${configData.docs.subdirs.prds}/`);
		console.log("   └── coding-standards.md");
	} catch (error) {
		console.error(
			chalk.red("❌ Installation failed:"),
			(error as Error).message
		);
		throw error;
	}
}

async function findExistingConfigs(cwd: string): Promise<string[]> {
	const configs: string[] = [];
	const possibleDirs = ["bmad-minimal"];
	for (const dir of possibleDirs) {
		const configPath = path.join(cwd, dir, "config.json");
		if (await exists(configPath)) {
			configs.push(`${dir}/config.json`);
		}
	}
	return configs;
}

async function gatherConfiguration(
	options: InstallCommandOptions,
	cwd: string
): Promise<ConfigAnswers> {
	const answers = await inquirer.prompt<ConfigAnswers>(
		getConfigFields(cwd, options)
	);

	if (!answers.projectName) {
		const response = await inquirer.prompt<{ projectName: string }>([
			{
				type: "input",
				name: "projectName",
				message: "Project name:",
				default: path.basename(cwd),
				validate: (input: string) =>
					input.trim() !== "" || "Project name is required",
			},
		]);
		answers.projectName = response.projectName;
	}

	if (!answers.dir && !answers.backendDir && !answers.frontendDir) {
		console.error(
			chalk.red(
				"❌ Installation aborted: provide at least one of App, Backend, or Frontend directory."
			)
		);
		throw new Error("No app/backend/frontend directory provided");
	}

	const { isNewProject } = await inquirer.prompt<{ isNewProject: boolean }>([
		{
			type: "confirm",
			name: "isNewProject",
			message: "Is this a new project?",
			default: true,
		},
	]);
	answers.projectType = isNewProject ? "greenfield" : "brownfield";
	return answers;
}

export default install;
