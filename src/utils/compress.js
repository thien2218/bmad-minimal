const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { getPath } = require("../utils/fileOperations");

/**
 * Compress the JSON configuration block in a single agent markdown file.
 *
 * @param {string} filePath - Path to the agent markdown file
 * @returns {Promise<{changed: boolean, error: Error|null}>} - Result indicating if file was changed and any error
 */
async function compressAgentConfigInFile(filePath) {
	try {
		const content = await fs.readFile(filePath, "utf-8");

		// Find the marker comment
		const markerIndex = content.indexOf("<!-- INSTRUCTIONS_AND_RULES:JSON -->");
		if (markerIndex === -1) {
			return { changed: false, error: null };
		}

		// Find the first ```json block after the marker
		const jsonBlockStart = content.indexOf("```json", markerIndex);
		if (jsonBlockStart === -1) {
			return { changed: false, error: null };
		}

		const jsonContentStart = jsonBlockStart + "```json".length;
		const jsonBlockEnd = content.indexOf("```", jsonContentStart);
		if (jsonBlockEnd === -1) {
			return { changed: false, error: null };
		}

		// Extract the JSON content
		const jsonContent = content
			.substring(jsonContentStart, jsonBlockEnd)
			.trim();
		if (!jsonContent) {
			return { changed: false, error: null };
		}

		// Parse and minify the JSON
		let parsedJson;
		try {
			parsedJson = JSON.parse(jsonContent);
		} catch (parseError) {
			// Soft fail: skip compression but don't throw
			console.warn(
				chalk.yellow(
					`Warning: Failed to parse JSON in ${filePath}: ${parseError.message}`
				)
			);
			return { changed: false, error: parseError };
		}

		const minifiedJson = JSON.stringify(parsedJson);

		// Replace the JSON content in the file
		const beforeBlock = content.substring(0, jsonContentStart);
		const afterBlock = content.substring(jsonBlockEnd);

		const newContent = beforeBlock + "\n" + minifiedJson + "\n" + afterBlock;

		// Write back to file
		await fs.writeFile(filePath, newContent, "utf-8");

		return { changed: true, error: null };
	} catch (error) {
		return { changed: false, error };
	}
}

/**
 * Compress JSON configuration blocks in all agent markdown files under a directory.
 * Processes both engineering/agents and planning/agents subdirectories.
 *
 * @param {string} rootDir - Root directory containing engineering and/or planning subdirs
 * @returns {Promise<{processed: number, modified: number, errors: number}>} - Statistics
 */
async function compressAgentConfigs(rootDir) {
	const stats = { processed: 0, modified: 0, errors: 0 };

	// Agent subdirectories to process
	const agentDirs = [
		path.join(rootDir, "engineering", "agents"),
		path.join(rootDir, "planning", "agents"),
	];

	for (const agentDir of agentDirs) {
		try {
			// Check if directory exists
			if (!(await fs.pathExists(agentDir))) {
				continue;
			}

			// Get all markdown files
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
					`Warning: Failed to process directory ${agentDir}: ${error.message}`
				)
			);
			stats.errors++;
		}
	}

	return stats;
}

// Export the function for use in other modules
module.exports = { compressAgentConfigs };
