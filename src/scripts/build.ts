import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { getPath } from "../utils/fileOperations";

const coreDir = getPath("core");
const AGENTS_DIRS = [
	path.join(coreDir, "engineering", "agents"),
	path.join(coreDir, "planning", "agents"),
];

interface AgentPersona {
	id?: string;
	title?: string;
	description?: string;
}

interface AgentCommand {
	name?: string;
	description?: string;
	steps?: string[];
	parameters?: string[];
	optionalParameters?: string[];
}

interface AgentConfig {
	persona?: { agent?: AgentPersona };
	commands?: AgentCommand[];
}

function parseAgentConfigFromMarkdown(
	content: string,
	filePath: string
): AgentConfig | null {
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
		return JSON.parse(jsonContent) as AgentConfig;
	} catch (parseError) {
		console.warn(
			chalk.yellow(
				`Warning: Failed to parse JSON in ${filePath}: ${
					(parseError as Error).message
				}`
			)
		);
		return null;
	}
}

async function bundleAgentWithDependencies(): Promise<void> {
	const bundledRoot = getPath("bundled");

	for (const agentDir of AGENTS_DIRS) {
		if (!(await fs.pathExists(agentDir))) {
			continue;
		}

		const categoryRoot = path.dirname(agentDir);
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
			const bundleParts: string[] = [];
			bundleParts.push(`# Agent file: ${file}`);
			bundleParts.push(agentContent.trimEnd());
			const config = parseAgentConfigFromMarkdown(agentContent, agentPath);

			if (config?.commands) {
				const dependencySet = new Set<string>();
				for (const command of config.commands) {
					if (!command?.steps) continue;
					for (const step of command.steps) {
						if (typeof step !== "string") continue;
						const trimmed = step.trim();
						if (trimmed) {
							dependencySet.add(trimmed);
						}
					}
				}

				for (const relPath of dependencySet) {
					const fullPath = path.join(categoryRoot, relPath);
					try {
						const depContent = await fs.readFile(fullPath, "utf-8");
						bundleParts.push(
							`\n\n# Dependency: ${relPath}\n\n${depContent.trimEnd()}`
						);
					} catch (error) {
						console.warn(
							chalk.yellow(
								`Warning: Failed to include dependency ${relPath} for agent ${agentPath}: ${
									(error as Error).message
								}`
							)
						);
					}
				}
			}

			await fs.writeFile(outputPath, bundleParts.join("\n\n"), "utf-8");
		}
	}
}

async function updateCheatSheetWithAgent(): Promise<void> {
	const cheatSheetPath = getPath("docs/cheat-sheet.md");
	const sections: string[] = [];

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
			const persona: AgentPersona = config.persona?.agent ?? {};
			const commands = Array.isArray(config.commands) ? config.commands : [];
			const agentId =
				persona.id && persona.id.trim()
					? persona.id.trim()
					: path.basename(agentPath, path.extname(agentPath));
			const title = persona.title?.trim() ?? "";
			const description = persona.description?.trim() ?? "";
			const sectionLines: string[] = [];
			sectionLines.push(title ? `## ${agentId} – ${title}` : `## ${agentId}`);

			if (description) {
				sectionLines.push("");
				sectionLines.push(description);
			}

			if (commands.length > 0) {
				sectionLines.push("");
				sectionLines.push("### Commands");
				sectionLines.push("");
				for (const cmd of commands) {
					if (!cmd?.name) continue;
					const name = cmd.name.trim();
					if (!name) continue;
					const params = Array.isArray(cmd.parameters) ? cmd.parameters : [];
					const optionalParams = Array.isArray(cmd.optionalParameters)
						? cmd.optionalParameters
						: [];
					const desc = cmd.description?.trim() ?? "";
					sectionLines.push(desc ? `- \`${name}\`: ${desc}` : `- \`${name}\``);
					if (params.length > 0) {
						sectionLines.push(`  - required: ${params.join(", ")}`);
					}
					if (optionalParams.length > 0) {
						sectionLines.push(`  - optional: ${optionalParams.join(", ")}`);
					}
					sectionLines.push("");
				}
				if (sectionLines[sectionLines.length - 1] === "") {
					sectionLines.pop();
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

	const content = `${sections.join("\n\n---\n\n")}\n`;
	await fs.ensureDir(path.dirname(cheatSheetPath));
	await fs.writeFile(cheatSheetPath, content, "utf-8");
}

async function main(): Promise<void> {
	try {
		console.log(chalk.blue("Running build pipeline...\n"));
		await bundleAgentWithDependencies();
		console.log(chalk.gray("  Bundled agent files into ./bundled"));
		await updateCheatSheetWithAgent();
		console.log(chalk.gray("  Updated docs/cheat-sheet.md"));
		console.log(chalk.green("\nBuild pipeline completed successfully."));
	} catch (error) {
		console.error(
			chalk.red("Build pipeline failed:"),
			(error as Error).message
		);
		process.exitCode = 1;
	}
}

if (require.main === module) {
	main();
}
