const inquirer = require("inquirer");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs-extra");
const {
	copyDirectory,
	readJson,
	writeJson,
	exists,
	getCoreDir,
} = require("../utils/fileOperations");
const { getConfigFields } = require("../utils/configFields");

async function update(options) {
	console.log(chalk.blue("🔄 BMad Minimal Update\n"));

	const cwd = process.cwd();
	const coreDir = getCoreDir();

	// Find existing configuration
	const configLocation = await findConfig(cwd);

	if (!configLocation) {
		console.error(chalk.red("❌ No BMad Minimal configuration found."));
		console.log(
			chalk.gray('Run "bmad-minimal install" to set up BMad Minimal first.')
		);
		return;
	}

	console.log(
		chalk.gray(`Found configuration at: ${configLocation.dir}/config.json`)
	);

	// Read existing config
	const configPath = path.join(cwd, configLocation.dir, "config.json");
	const config = await readJson(configPath);

	if (!config) {
		console.error(chalk.red("❌ Failed to read configuration file."));
		return;
	}

	// Prompt for any missing configurable fields before proceeding
	await promptForMissingConfig({ cwd, config, configPath });

	// Confirm update
	if (!options.force) {
		console.log(
			chalk.yellow(
				"\n⚠️ This will update all BMad files to the latest version."
			)
		);
		console.log(
			chalk.yellow(
				"   Your config.json will be preserved, but all other files will be overwritten."
			)
		);

		const { proceed } = await inquirer.prompt([
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

	console.log(chalk.blue("\n📦 Updating BMad Minimal files...\n"));

	try {
		const baseDir = path.join(cwd, configLocation.dir);

		// Backup config.json
		const configBackup = { ...config };

		// Update engineering directory
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

		// Update planning directory if it exists
		const planningDest = path.join(baseDir, "planning");
		if (await exists(planningDest)) {
			const planningSource = path.join(coreDir, "planning");
			console.log(chalk.gray("  Updating planning files..."));
			await fs.remove(planningDest);
			await copyDirectory(planningSource, planningDest);
		}

		// Restore config.json
		console.log(chalk.gray("  Preserving configuration..."));
		await writeJson(configPath, configBackup);

		// Update technical preferences if it exists
		const docsDir = path.join(cwd, config.docs.dir);
		const techPrefsPath = path.join(docsDir, "technical-preferences.md");

		if (await exists(techPrefsPath)) {
			console.log(chalk.gray("  Updating technical preferences from template..."));
			const templateTechPrefsPath = path.join(__dirname, "../templates/technical-preferences.md");
			await fs.copy(templateTechPrefsPath, techPrefsPath);
		}

		// Ensure all doc directories still exist
		for (const subDir of Object.values(config.docs.subdirs)) {
			await fs.ensureDir(path.join(docsDir, subDir));
		}

		console.log(chalk.green("\n✅ BMad Minimal update complete!"));

		// Show what was updated
		console.log(chalk.cyan("\n📋 Updated components:"));
		console.log("   ✓ Engineering files");
		if (await exists(planningDest)) {
			console.log("   ✓ Planning files");
		}
		if (await exists(techPrefsPath)) {
			console.log("   ✓ Technical preferences");
		}
		console.log("   ✓ Configuration preserved");

		// Check for version differences if possible
		const packageJsonPath = path.join(coreDir, "../package.json");
		if (await exists(packageJsonPath)) {
			const packageJson = await readJson(packageJsonPath);
			console.log(chalk.gray(`\nVersion: ${packageJson.version}`));
		}
	} catch (error) {
		console.error(chalk.red("❌ Update failed:"), error.message);
		throw error;
	}
}

async function findConfig(cwd) {
	const possibleDirs = [".bmad-minimal", ".bmad", "bmad"];

	for (const dir of possibleDirs) {
		const configPath = path.join(cwd, dir, "config.json");
		if (await exists(configPath)) {
			return { dir, path: configPath };
		}
	}

	return null;
}

function getValueByPath(object, accessKey) {
	const parts = accessKey.split(".");
	let current = object;
	for (const part of parts) {
		if (current == null || typeof current !== "object") return undefined;
		current = current[part];
	}
	return current;
}

function setValueByPath(object, accessKey, value) {
	const parts = accessKey.split(".");
	let current = object;
	for (let i = 0; i < parts.length - 1; i++) {
		const part = parts[i];
		if (current[part] == null || typeof current[part] !== "object") {
			current[part] = {};
		}
		current = current[part];
	}
	current[parts[parts.length - 1]] = value;
}

async function promptForMissingConfig({ cwd, config, configPath }) {
	const allFields = getConfigFields({ cwd, config });
	const configurable = allFields.filter((f) => !!f.accessKey);

	const missing = configurable.filter((field) => {
		const val = getValueByPath(config, field.accessKey);
		if (val === undefined || val === null) return true;
		if (typeof val === "string" && val.trim() === "") return true;
		return false;
	});

	if (missing.length === 0) return;

	const prompts = missing.map((field) => {
		return {
			type: field.type || "input",
			name: field.name,
			message: field.message,
			default: typeof field.default === "function" ? field.default() : field.default,
		};
	});

	const answers = await inquirer.prompt(prompts);

	for (const field of missing) {
		const rawValue = answers[field.name];
		const value = typeof field.filter === "function" ? field.filter(rawValue) : rawValue;
		setValueByPath(config, field.accessKey, value);
	}

	await writeJson(configPath, config);
}

module.exports = update;
