#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const packageJson = require("../package.json");
const install = require("../src/commands/install");
const update = require("../src/commands/update");

const program = new Command();

program
	.name("bmad-minimal")
	.description(
		"BMad Minimal - A streamlined development workflow for AI-assisted projects"
	)
	.version(packageJson.version);

program
	.command("install")
	.description(
		"Install BMad Minimal configuration and documentation structure"
	)
	.option("-p, --project <name>", "Specify project name")
	.option(
		"-d, --dir <path>",
		"Base directory for BMad files (default: .bmad-minimal)"
	)
	.action(async (options) => {
		try {
			await install(options);
		} catch (error) {
			console.error(chalk.red("❌ Installation failed:"), error.message);
			process.exit(1);
		}
	});

program
	.command("update")
	.description(
		"Update documentation to the latest version while preserving config.json"
	)
	.option("-f, --force", "Force update without confirmation")
	.action(async (options) => {
		try {
			await update(options);
		} catch (error) {
			console.error(chalk.red("❌ Update failed:"), error.message);
			process.exit(1);
		}
	});

program.parse();
