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

module.exports = update;
