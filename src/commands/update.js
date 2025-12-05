const inquirer = require("inquirer");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs-extra");
const {
	copyDirectory,
	readJson,
	writeJson,
	exists,
	getPath,
} = require("../utils/fileOperations");
const { ensureDocsStructure } = require("../utils/docs");
const {
	findConfig,
	ensureDocsDefaults,
	getConfigFields,
	shouldGenerateCSPrompt,
} = require("../utils/config");
const { compressAgentConfigs } = require("../utils/compress");

/**
 * Update existing BMad Minimal installation to latest core templates,
 * preserving config.json and ensuring docs structure.
 *
 * @param {Object} options - CLI options parsed upstream.
 * @returns {Promise<void>}
 */
async function update(options) {
	console.log(chalk.blue("🔄 BMad Minimal Update\n"));

	const cwd = process.cwd();
	const coreDir = getPath("core");

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
	const configUpdated = await promptMissingConfig({ cwd, config, configPath });

	// Confirm update
	if (!options.force) {
		console.log(
			chalk.yellow(
				"\n⚠️  This will update all BMad files to the latest version."
			)
		);
		const preserveMessage = configUpdated
			? "   Your config.json was updated with missing fields and other fields will be preserved; all other files will be overwritten."
			: "   Your config.json will be preserved, but all other files will be overwritten.";
		console.log(chalk.yellow(preserveMessage));

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

		ensureDocsDefaults(config);

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

		// Compress agent JSON configurations
		console.log(chalk.gray("  Compressing agent configurations..."));
		await compressAgentConfigs(baseDir);

		// Restore config.json
		console.log(chalk.gray("  Preserving configuration..."));
		await writeJson(configPath, configBackup);

		// Add coding standards if it doesn't exists
		const docsDir = path.join(cwd, config.docs.dir);
		await shouldGenerateCSPrompt(config);

		// Ensure all doc directories still exist
		await ensureDocsStructure(cwd, config);

		console.log(chalk.green("\n✅ BMad Minimal update complete!"));

		// Show what was updated
		console.log(chalk.cyan("\n📋 Updated components:"));
		console.log("   ✓ Engineering files");
		console.log("   ✓ Planning files");
		console.log("   ✓ Coding standards");
		console.log("   ✓ Configuration");

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

async function promptMissingConfig({ cwd, config, configPath }) {
	const allFields = getConfigFields(cwd);
	const configurable = allFields.filter((f) => !!f.accessKey);

	const missing = configurable.filter((field) => {
		const val = getValueByPath(config, field.accessKey);
		return val === undefined;
	});

	if (missing.length === 0) return false;

	const answers = await inquirer.prompt(missing);

	for (const field of missing) {
		const rawValue = answers[field.name];
		const value =
			typeof field.filter === "function" ? field.filter(rawValue) : rawValue;
		setValueByPath(config, field.accessKey, value);
	}

	await writeJson(configPath, config);
	return true;
}

module.exports = update;
