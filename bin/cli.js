#!/usr/bin/env node

const { program } = require("commander");
const chalk = require("chalk");
const path = require("path");
const { setupWorkspace } = require("../src/setup");
const { updatePackage } = require("../src/update");

program
	.name("bmad-minimal")
	.description(
		"CLI tool to set up and manage BMAD minimal workspace for AI-assisted development"
	)
	.version(require("../package.json").version);

// Install command (default behavior)
program
	.command("install", { isDefault: true })
	.alias("i")
	.description("Install BMAD workspace in target directory")
	.argument(
		"[target-directory]",
		"Directory where to create the bmad-minimal workspace",
		"."
	)
	.option("-y, --yes", "Skip interactive prompts and use defaults")
	.action(async (targetDirectory, options) => {
		try {
			console.log(chalk.cyan.bold("🚀 BMAD Minimal Installation"));
			console.log(
				chalk.gray("Setting up your AI-assisted development workspace...\n")
			);

			const fullPath = path.resolve(process.cwd(), targetDirectory);
			await setupWorkspace(fullPath, options);

			console.log(
				chalk.green.bold("\n✅ BMAD workspace installation complete!")
			);
			console.log(
				chalk.gray("Your workspace is ready for AI-assisted development.")
			);
			console.log(
				chalk.blue(
					"\n💡 Tip: Use `npx @thienhuynh/bmad-minimal update` to get the latest version."
				)
			);
		} catch (error) {
			console.error(
				chalk.red.bold("\n❌ Installation failed:"),
				error.message
			);
			process.exit(1);
		}
	});

// Update command
program
	.command("update")
	.alias("u")
	.description("Update BMAD workspace to the latest version")
	.argument(
		"[workspace-directory]",
		"Directory containing the bmad-minimal workspace",
		"bmad-minimal"
	)
	.option("-y, --yes", "Skip confirmation prompts")
	.option("--backup", "Create backup before updating", true)
	.action(async (workspaceDirectory, options) => {
		try {
			console.log(chalk.cyan.bold("🔄 BMAD Minimal Update"));
			console.log(
				chalk.gray("Updating your workspace to the latest version...\n")
			);

			const fullPath = path.resolve(process.cwd(), workspaceDirectory);
			await updatePackage(fullPath, options);

			console.log(chalk.green.bold("\n✅ BMAD workspace update complete!"));
			console.log(chalk.gray("Your workspace is now up to date."));
		} catch (error) {
			console.error(chalk.red.bold("\n❌ Update failed:"), error.message);
			process.exit(1);
		}
	});

program.parse();
