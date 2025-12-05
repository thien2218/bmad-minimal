const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { getPath } = require("../utils/fileOperations");

const coreDir = getPath("core");
const AGENTS_DIRS = [
	path.join(coreDir, "engineering", "agents"),
	path.join(coreDir, "planning", "agents"),
];

/**
 * Parse the JSON configuration block from an agent markdown file content.
 *
 * @param {string} content
 * @param {string} filePath
 * @returns {object|null}
 */
function parseAgentConfigFromMarkdown(content, filePath) {
	const markerIndex = content.indexOf("```json");
	if (markerIndex === -1) {
		return null;
	}

	const jsonContentStart = markerIndex + "```json".length;
	const jsonBlockEnd = content.indexOf("```", jsonContentStart);
	if (jsonBlockEnd === -1) {
		return null;
	}

	const jsonContent = content.substring(jsonContentStart, jsonBlockEnd).trim();
	if (!jsonContent) {
		return null;
	}

	try {
		return JSON.parse(jsonContent);
	} catch (parseError) {
		console.warn(
			chalk.yellow(
				`Warning: Failed to parse JSON in ${filePath}: ${parseError.message}`
			)
		);
		return null;
	}
}

/**
 * Bundle all agent markdown files and their referenced dependency files
 * (from each JSON config's commands[].steps) into .txt files under:
 *   bundled/<category>/<agentName>.txt
 * using fixed AGENTS_DIRS.
 *
 * @returns {Promise<void>}
 */
async function bundleAgentWithDependencies() {
	const bundledRoot = getPath("bundled");

	for (const agentDir of AGENTS_DIRS) {
		if (!(await fs.pathExists(agentDir))) {
			continue;
		}

		const categoryRoot = path.dirname(agentDir); // e.g., core/engineering or core/planning
		const category = path.basename(categoryRoot);
		const outputCategoryDir = path.join(bundledRoot, category);
		await fs.ensureDir(outputCategoryDir);

		const files = await fs.readdir(agentDir);
		const markdownFiles = files.filter((file) => file.endsWith(".md"));

		for (const file of markdownFiles) {
			const agentPath = path.join(agentDir, file);
			const agentName = path.basename(file, path.extname(file));
			const outputPath = path.join(outputCategoryDir, `${agentName}.txt`);

			const agentContent = await fs.readFile(agentPath, "utf-8");
			const bundleParts = [];

			bundleParts.push(`# Agent file: ${file}`);
			bundleParts.push(agentContent.trimEnd());

			const config = parseAgentConfigFromMarkdown(agentContent, agentPath);

			if (config && Array.isArray(config.commands)) {
				const dependencySet = new Set();

				for (const command of config.commands) {
					if (!command || !Array.isArray(command.steps)) continue;
					for (const step of command.steps) {
						if (typeof step !== "string") continue;
						const trimmed = step.trim();
						if (!trimmed) continue;
						dependencySet.add(trimmed);
					}
				}

				for (const relPath of dependencySet) {
					const fullPath = path.join(categoryRoot, relPath);
					try {
						const depContent = await fs.readFile(fullPath, "utf-8");
						bundleParts.push(
							`\n\n# Dependency: ${relPath}\n\n` + depContent.trimEnd()
						);
					} catch (error) {
						console.warn(
							chalk.yellow(
								`Warning: Failed to include dependency ${relPath} for agent ${agentPath}: ${error.message}`
							)
						);
					}
				}
			}

			await fs.writeFile(outputPath, bundleParts.join("\n\n"), "utf-8");
		}
	}
}

/**
 * Update docs/cheat-sheet.md with all agents' persona and commands
 * discovered under AGENTS_DIRS. Appends or creates sections per agent.
 *
 * @returns {Promise<void>}
 */
async function updateCheatSheetWithAgent() {
	const cheatSheetPath = getPath("docs/cheat-sheet.md");

	let existing = "";
	try {
		existing = await fs.readFile(cheatSheetPath, "utf-8");
	} catch (e) {
		if (e.code !== "ENOENT") throw e;
	}

	const sections = [];

	for (const agentDir of AGENTS_DIRS) {
		if (!(await fs.pathExists(agentDir))) {
			continue;
		}

		const files = await fs.readdir(agentDir);
		const markdownFiles = files.filter((file) => file.endsWith(".md"));

		for (const file of markdownFiles) {
			const agentPath = path.join(agentDir, file);
			const agentContent = await fs.readFile(agentPath, "utf-8");
			const config = parseAgentConfigFromMarkdown(agentContent, agentPath);
			if (!config) continue;

			const persona =
				config.persona && config.persona.agent ? config.persona.agent : {};
			const commands = Array.isArray(config.commands) ? config.commands : [];

			const agentId =
				typeof persona.id === "string" && persona.id.trim()
					? persona.id.trim()
					: path.basename(agentPath, path.extname(agentPath));
			const title =
				typeof persona.title === "string" && persona.title.trim()
					? persona.title.trim()
					: "";
			const description =
				typeof persona.description === "string" &&
				persona.description.trim()
					? persona.description.trim()
					: "";

			const sectionLines = [];

			if (title) {
				sectionLines.push(`## ${agentId} – ${title}`);
			} else {
				sectionLines.push(`## ${agentId}`);
			}

			if (description) {
				sectionLines.push("");
				sectionLines.push(description);
			}

			if (commands.length > 0) {
				sectionLines.push("");
				sectionLines.push("### Commands");
				sectionLines.push("");
				for (const cmd of commands) {
					if (!cmd || typeof cmd.name !== "string") continue;
					const name = cmd.name.trim();
					if (!name) continue;
					const desc =
						typeof cmd.description === "string" && cmd.description.trim()
							? cmd.description.trim()
							: "";
					if (desc) {
						sectionLines.push(`- \`${name}\`: ${desc}`);
					} else {
						sectionLines.push(`- \`${name}\``);
					}
				}
			}

			const section = sectionLines.join("\n");
			if (section.trim()) {
				sections.push(section);
			}
		}
	}

	if (sections.length === 0) {
		return;
	}

	const trimmedExisting = existing.trim();
	const newSections = sections.join("\n\n") + "\n";

	let finalContent;
	if (trimmedExisting) {
		finalContent = trimmedExisting + "\n\n" + newSections;
	} else {
		finalContent = newSections;
	}

	await fs.ensureDir(path.dirname(cheatSheetPath));
	await fs.writeFile(cheatSheetPath, finalContent, "utf-8");
}

/**
	* Run full build pipeline:
	* - compress agent configs
	* - bundle agents with dependencies
	* - update cheat sheet
	*/
async function main() {
	try {
		console.log(chalk.blue("Running build pipeline...\n"));

		await bundleAgentWithDependencies();
		console.log(chalk.gray("  Bundled agent files into ./bundled"));

		await updateCheatSheetWithAgent();
		console.log(chalk.gray("  Updated docs/cheat-sheet.md"));

		console.log(chalk.green("\nBuild pipeline completed successfully."));
	} catch (error) {
		console.error(chalk.red("Build pipeline failed:"), error.message);
		process.exitCode = 1;
	}
}

if (require.main === module) {
	main();
}
