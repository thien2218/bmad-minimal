const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { execSync } = require("child_process");
const { createTemplateFiles } = require("./templates");
const { detectProjectInfo } = require("./detection");

async function updatePackage(workspacePath, options) {
	// Validate workspace exists
	if (!(await fs.pathExists(workspacePath))) {
		throw new Error(`Workspace directory '${workspacePath}' does not exist`);
	}

	// Check if it's a valid BMAD workspace
	const bmadCorePath = path.join(workspacePath, ".bmad-core");
	const agentsPath = path.join(workspacePath, ".agents");

	if (!(await fs.pathExists(bmadCorePath))) {
		throw new Error(
			`'${workspacePath}' does not appear to be a BMAD workspace (missing .bmad-core)`
		);
	}

	console.log(chalk.blue("🔍 Analyzing existing workspace..."));

	// Read existing configuration
	const existingConfig = await readExistingConfig(bmadCorePath);
	const currentVersion = await getCurrentVersion(workspacePath);
	const latestVersion = require("../package.json").version;

	console.log(
		chalk.gray(`Current workspace version: ${currentVersion || "unknown"}`)
	);
	console.log(chalk.gray(`Latest BMAD version: ${latestVersion}`));

	// Check if update is needed
	if (currentVersion === latestVersion) {
		console.log(chalk.yellow("✨ Workspace is already up to date!"));
		return;
	}

	// Confirm update
	if (!options.yes) {
		const { confirmUpdate } = await inquirer.prompt([
			{
				type: "confirm",
				name: "confirmUpdate",
				message: "Do you want to update your BMAD workspace?",
				default: true,
			},
		]);

		if (!confirmUpdate) {
			throw new Error("Update cancelled by user");
		}
	}

	// Create backup if requested
	let backupPath = null;
	if (options.backup) {
		backupPath = await createBackup(workspacePath);
		console.log(chalk.blue(`📦 Backup created at: ${backupPath}`));
	}

	try {
		// Perform update
		await performUpdate(workspacePath, existingConfig, latestVersion);
	} catch (error) {
		// Restore from backup if available
		if (backupPath) {
			console.log(chalk.yellow("⚠️ Restoring from backup..."));
			try {
				await restoreFromBackup(backupPath, workspacePath);
				console.log(chalk.yellow("✅ Backup restored successfully"));
			} catch (restoreError) {
				console.error(
					chalk.red("❌ Failed to restore backup:"),
					restoreError.message
				);
			}
		}
		throw error;
	}

	// Update version file
	await updateVersionFile(workspacePath, latestVersion);
}

async function readExistingConfig(bmadCorePath) {
	const configPath = path.join(bmadCorePath, "config.json");

	if (await fs.pathExists(configPath)) {
		try {
			const config = await fs.readJson(configPath);

			// Convert config back to our internal format
			return {
				includePlanning: await fs.pathExists(
					path.join(path.dirname(bmadCorePath), "planning")
				),
				folders: {
					docs: extractLocationFromPath(config.prd?.file || "docs/prd.md"),
					epics: config.epic?.location || "docs/epics",
					stories: config.story?.location || "docs/stories",
					qa: config.qaLocation || "docs/qa",
				},
			};
		} catch (error) {
			console.warn(
				chalk.yellow("⚠️ Could not read existing config, using defaults")
			);
		}
	}

	// Default configuration
	return {
		includePlanning: true,
		folders: {
			docs: "docs",
			epics: "docs/epics",
			stories: "docs/stories",
			qa: "docs/qa",
		},
	};
}

function extractLocationFromPath(filePath) {
	// Extract directory from file path (e.g., 'docs/prd.md' -> 'docs')
	return path.dirname(filePath);
}

async function getCurrentVersion(workspacePath) {
	const versionPath = path.join(workspacePath, ".bmad-version");

	if (await fs.pathExists(versionPath)) {
		try {
			const version = await fs.readFile(versionPath, "utf8");
			return version.trim();
		} catch (error) {
			// Ignore errors, return null
		}
	}

	return null;
}

async function createBackup(workspacePath) {
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const backupName = `bmad-backup-${timestamp}`;
	const backupPath = path.join(path.dirname(workspacePath), backupName);

	await fs.copy(workspacePath, backupPath, {
		filter: (src) => {
			// Don't backup .git directory (too large and not needed)
			return !src.includes(".git");
		},
	});

	return backupPath;
}

async function restoreFromBackup(backupPath, workspacePath) {
	// Remove current workspace
	await fs.remove(workspacePath);

	// Restore from backup
	await fs.copy(backupPath, workspacePath);

	// Clean up backup
	await fs.remove(backupPath);
}

async function performUpdate(workspacePath, existingConfig, newVersion) {
	console.log(chalk.blue("🔄 Updating workspace components..."));

	// Detect project info from parent directory
	const projectPath = path.dirname(workspacePath);
	const projectInfo = await detectProjectInfo(projectPath);

	// Update template files
	await createTemplateFiles(workspacePath, existingConfig, projectInfo);

	// Preserve user customizations in technical-preferences.md
	await preserveUserCustomizations(workspacePath);

	// Update .gitignore if needed
	await updateGitignore(workspacePath);

	console.log(chalk.green("✅ Core files updated"));
}

async function preserveUserCustomizations(workspacePath) {
	const techPrefsPath = path.join(
		workspacePath,
		".bmad-core",
		"technical-preferences.md"
	);

	if (await fs.pathExists(techPrefsPath)) {
		try {
			const content = await fs.readFile(techPrefsPath, "utf8");

			// Check if file has been customized (not auto-generated)
			if (!content.includes("Auto-generated by BMAD Minimal CLI")) {
				// File has been customized, create a backup
				const backupPath = `${techPrefsPath}.backup-${Date.now()}`;
				await fs.copy(techPrefsPath, backupPath);

				console.log(
					chalk.yellow(`⚠️ Technical preferences have been customized`)
				);
				console.log(
					chalk.gray(
						`   Original backed up to: ${path.basename(backupPath)}`
					)
				);
				console.log(
					chalk.gray("   Please merge your changes manually if needed.")
				);
			}
		} catch (error) {
			// Ignore errors, continue with update
		}
	}
}

async function updateGitignore(workspacePath) {
	const gitignorePath = path.join(workspacePath, ".gitignore");

	const expectedContent = `# BMAD Core files
.bmad-core/
.agents/

# Planning files (optional - remove if you want to track planning)
planning/

# Node modules (if applicable)
node_modules/

# Environment files
.env
.env.local
.env.*.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
`;

	// Only update if gitignore doesn't exist or is minimal
	if (!(await fs.pathExists(gitignorePath))) {
		await fs.writeFile(gitignorePath, expectedContent);
	} else {
		const existingContent = await fs.readFile(gitignorePath, "utf8");

		// Only update if it looks like our default gitignore
		if (
			existingContent.includes("# BMAD Core files") &&
			existingContent.length < 500
		) {
			await fs.writeFile(gitignorePath, expectedContent);
		}
	}
}

async function updateVersionFile(workspacePath, version) {
	const versionPath = path.join(workspacePath, ".bmad-version");
	await fs.writeFile(versionPath, version);
}

module.exports = { updatePackage };
