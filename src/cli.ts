#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { install, InstallCommandOptions } from "./commands/install";
import { update, UpdateCommandOptions } from "./commands/update";

const packageJson = require("../package.json") as { version?: string };

const program = new Command();

program
	.name("swaad")
	.description(
		"SWAAD (Software Agile Development with AI) - A streamlined development workflow for AI-assisted projects, designed for developers"
	)
	.version(packageJson.version ?? "0.0.0");

program
	.command("install")
	.description("Install SWAAD configuration and documentation structure")
	.option("-p, --project <name>", "Specify project name")
	.option("-d, --dir <path>", "Base directory for SWAAD files (default: swaad)")
	.action(async (options: InstallCommandOptions) => {
		try {
			await install(options);
		} catch (error) {
			console.error(
				chalk.red("❌ Installation failed:"),
				(error as Error).message
			);
			process.exit(1);
		}
	});

program
	.command("update")
	.description(
		"Update documentation to the latest version while preserving config.json"
	)
	.option("-f, --force", "Force update without confirmation")
	.action(async (options: UpdateCommandOptions) => {
		try {
			await update(options);
		} catch (error) {
			console.error(chalk.red("❌ Update failed:"), (error as Error).message);
			process.exit(1);
		}
	});

export async function runCli(argv: string[] = process.argv): Promise<void> {
	await program.parseAsync(argv);
}

if (require.main === module) {
	runCli();
}
