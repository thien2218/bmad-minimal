import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import fs from "fs-extra";
import {
	copyDirectory,
	readJson,
	writeJson,
	exists,
	getPath,
} from "../utils/fileOperations";
import { ensureDocsStructure, copyCheatSheetToWorkspace } from "../utils/docs";
import {
	findConfig,
	ensureDocsDefaults,
	getConfigFields,
	shouldGenerateCSPrompt,
	ConfigAnswers,
	SwaadConfig,
} from "../utils/config";
import { compressAgentConfigs } from "../utils/compress";

export interface UpdateCommandOptions {
	force?: boolean;
}

export async function update(
	options: UpdateCommandOptions = {}
): Promise<void> {
	console.log(chalk.blue("🔄 SWAAD Update\n"));
	const cwd = process.cwd();
	const coreDir = getPath("core");
	const configLocation = await findConfig(cwd);

	if (!configLocation) {
		console.error(chalk.red("❌ No SWAAD configuration found."));
		console.log(chalk.gray('Run "swaad install" to set up SWAAD first.'));
		return;
	}

	console.log(
		chalk.gray(`Found configuration at: ${configLocation.dir}/config.json`)
	);

	const configPath = path.join(cwd, configLocation.dir, "config.json");
	const config = await readJson<SwaadConfig>(configPath);

	if (!config) {
		console.error(chalk.red("❌ Failed to read configuration file."));
		return;
	}

	const configUpdated = await promptMissingConfig({ cwd, config, configPath });

	if (!options.force) {
		console.log(
			chalk.yellow(
				"\n⚠️  This will update all SWAAD files to the latest version."
			)
		);
		const preserveMessage = configUpdated
			? "   Your config.json was updated with missing fields and other fields will be preserved; all other files will be overwritten."
			: "   Your config.json will be preserved, but all other files will be overwritten.";
		console.log(chalk.yellow(preserveMessage));
		const { proceed } = await inquirer.prompt<{ proceed: boolean }>([
			{
				type: "confirm",
				name: "proceed",
				message: "Do you want to proceed with the update?",
				default: true,
			},
		]);
		if (!proceed) {
			console.log(chalk.gray("Update cancelled."));
			return;
		}
	}

	console.log(chalk.blue("\n📦 Updating SWAAD files...\n"));

	try {
		const baseDir = path.join(cwd, configLocation.dir);
		ensureDocsDefaults(config);
		const configBackup: SwaadConfig = JSON.parse(JSON.stringify(config));
		const engineeringSource = path.join(coreDir, "engineering");
		const engineeringDest = path.join(baseDir, "engineering");

		if (await exists(engineeringDest)) {
			console.log(chalk.gray("  Updating engineering files..."));
			await fs.remove(engineeringDest);
			await copyDirectory(engineeringSource, engineeringDest);
		} else {
			console.log(chalk.gray("  Installing engineering files..."));
			await copyDirectory(engineeringSource, engineeringDest);
		}

		const planningDest = path.join(baseDir, "planning");
		if (await exists(planningDest)) {
			const planningSource = path.join(coreDir, "planning");
			console.log(chalk.gray("  Updating planning files..."));
			await fs.remove(planningDest);
			await copyDirectory(planningSource, planningDest);
		}

		console.log(chalk.gray("  Compressing agent configurations..."));
		await compressAgentConfigs(baseDir);
		console.log(chalk.gray("  Preserving configuration..."));
		await writeJson(configPath, configBackup);
		await shouldGenerateCSPrompt(configBackup);

		try {
			await copyCheatSheetToWorkspace(cwd, configBackup);
			console.log(
				chalk.gray(
					`  Copied cheat sheet to ${configBackup.docs.dir}/cheat-sheet.md`
				)
			);
		} catch (error) {
			console.log(
				chalk.yellow(
					`  Warning: failed to copy cheat sheet: ${(error as Error).message}`
				)
			);
		}

		await ensureDocsStructure(cwd, configBackup);
		console.log(chalk.green("\n✅ SWAAD update complete!"));
		console.log(chalk.cyan("\n📋 Updated components:"));
		console.log("   ✓ Engineering files");
		console.log("   ✓ Planning files");
		console.log("   ✓ Coding standards");
		console.log("   ✓ Configuration");

		const packageJsonPath = path.join(coreDir, "../package.json");
		if (await exists(packageJsonPath)) {
			const packageJson = await readJson<{ version?: string }>(packageJsonPath);
			if (packageJson?.version) {
				console.log(chalk.gray(`\nVersion: ${packageJson.version}`));
			}
		}
	} catch (error) {
		console.error(chalk.red("❌ Update failed:"), (error as Error).message);
		throw error;
	}
}

function getValueByPath(
	object: Record<string, unknown>,
	accessKey: string
): unknown {
	const parts = accessKey.split(".");
	let current: unknown = object;
	for (const part of parts) {
		if (current == null || typeof current !== "object") return undefined;
		current = (current as Record<string, unknown>)[part];
	}
	return current;
}

function setValueByPath(
	object: Record<string, unknown>,
	accessKey: string,
	value: unknown
): void {
	const parts = accessKey.split(".");
	let current: Record<string, unknown> = object;
	for (let i = 0; i < parts.length - 1; i++) {
		const part = parts[i];
		if (current[part] == null || typeof current[part] !== "object") {
			current[part] = {};
		}
		current = current[part] as Record<string, unknown>;
	}
	current[parts[parts.length - 1]] = value;
}

async function promptMissingConfig({
	cwd,
	config,
	configPath,
}: {
	cwd: string;
	config: SwaadConfig;
	configPath: string;
}): Promise<boolean> {
	const allFields = getConfigFields(cwd);
	const configurable = allFields.filter((field) => !!field.accessKey);
	const missing = configurable.filter((field) => {
		const val = field.accessKey
			? getValueByPath(config as Record<string, unknown>, field.accessKey)
			: undefined;
		return val === undefined;
	});

	if (missing.length === 0) return false;

	const answers = await inquirer.prompt<ConfigAnswers>(missing);

	for (const field of missing) {
		if (!field.accessKey) continue;
		const rawValue = answers[field.name as keyof ConfigAnswers];
		const value =
			typeof field.filter === "function"
				? field.filter(rawValue, answers as ConfigAnswers)
				: rawValue;
		setValueByPath(config as Record<string, unknown>, field.accessKey, value);
	}

	await writeJson(configPath, config);
	return true;
}

export default update;
