import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

interface CompressionResult {
	changed: boolean;
	error: Error | null;
}

interface CompressionStats {
	processed: number;
	modified: number;
	errors: number;
}

async function compressAgentConfigInFile(
	filePath: string
): Promise<CompressionResult> {
	try {
		const content = await fs.readFile(filePath, "utf-8");
		const markerIndex = content.indexOf("<!-- INSTRUCTIONS_AND_RULES:JSON -->");
		if (markerIndex === -1) {
			return { changed: false, error: null };
		}

		const jsonBlockStart = content.indexOf("```json", markerIndex);
		if (jsonBlockStart === -1) {
			return { changed: false, error: null };
		}

		const jsonContentStart = jsonBlockStart + "```json".length;
		const jsonBlockEnd = content.indexOf("```", jsonContentStart);
		if (jsonBlockEnd === -1) {
			return { changed: false, error: null };
		}

		const jsonContent = content
			.substring(jsonContentStart, jsonBlockEnd)
			.trim();
		if (!jsonContent) {
			return { changed: false, error: null };
		}

		let parsedJson: unknown;
		try {
			parsedJson = JSON.parse(jsonContent);
		} catch (parseError) {
			console.warn(
				chalk.yellow(
					`Warning: Failed to parse JSON in ${filePath}: ${
						(parseError as Error).message
					}`
				)
			);
			return { changed: false, error: parseError as Error };
		}

		const minifiedJson = JSON.stringify(parsedJson);
		const beforeBlock = content.substring(0, jsonContentStart);
		const afterBlock = content.substring(jsonBlockEnd);
		const newContent = `${beforeBlock}\n${minifiedJson}\n${afterBlock}`;
		await fs.writeFile(filePath, newContent, "utf-8");
		return { changed: true, error: null };
	} catch (error) {
		return { changed: false, error: error as Error };
	}
}

export async function compressAgentConfigs(
	rootDir: string
): Promise<CompressionStats> {
	const stats: CompressionStats = { processed: 0, modified: 0, errors: 0 };
	const agentDirs = [
		path.join(rootDir, "engineering", "agents"),
		path.join(rootDir, "planning", "agents"),
	];

	for (const agentDir of agentDirs) {
		try {
			if (!(await fs.pathExists(agentDir))) {
				continue;
			}

			const files = await fs.readdir(agentDir);
			const markdownFiles = files.filter((file) => file.endsWith(".md"));

			for (const file of markdownFiles) {
				const filePath = path.join(agentDir, file);
				stats.processed++;
				const result = await compressAgentConfigInFile(filePath);
				if (result.error) {
					stats.errors++;
				}
				if (result.changed) {
					stats.modified++;
				}
			}
		} catch (error) {
			console.warn(
				chalk.yellow(
					`Warning: Failed to process directory ${agentDir}: ${
						(error as Error).message
					}`
				)
			);
			stats.errors++;
		}
	}

	return stats;
}
