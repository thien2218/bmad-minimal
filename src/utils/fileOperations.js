const fs = require("fs-extra");
const path = require("path");

/**
 * Copy directory recursively.
 * @param {string} source - Absolute or relative path to copy from.
 * @param {string} destination - Destination directory path.
 * @param {string[]} [excludePatterns] - Array of regex string patterns to exclude by name.
 * @returns {Promise<void>}
 */
async function copyDirectory(source, destination, excludePatterns = []) {
	await fs.ensureDir(destination);

	const items = await fs.readdir(source, { withFileTypes: true });

	for (const item of items) {
		const sourcePath = path.join(source, item.name);
		const destPath = path.join(destination, item.name);

		// Check if item should be excluded
		const shouldExclude = excludePatterns.some((pattern) =>
			item.name.match(new RegExp(pattern))
		);

		if (shouldExclude) continue;

		if (item.isDirectory()) {
			await copyDirectory(sourcePath, destPath, excludePatterns);
		} else {
			await fs.copy(sourcePath, destPath, { overwrite: true });
		}
	}
}

/**
 * Read and parse JSON file.
 * @param {string} filePath
 * @returns {Promise<any|null>} Parsed JSON object or null if file does not exist.
 */
async function readJson(filePath) {
	try {
		const content = await fs.readFile(filePath, "utf-8");
		return JSON.parse(content);
	} catch (error) {
		if (error.code === "ENOENT") {
			return null;
		}
		throw error;
	}
}

/**
 * Write JSON file with pretty formatting.
 * @param {string} filePath
 * @param {any} data
 * @returns {Promise<void>}
 */
async function writeJson(filePath, data) {
	await fs.ensureDir(path.dirname(filePath));
	await fs.writeFile(filePath, JSON.stringify(data, null, "\t"));
}

/**
 * Get the absolute path to the core/ directory.
 * @returns {string}
 */
function getCoreDir() {
	const corePath = "../../core";
	return path.join(__dirname, corePath);
}

/**
 * Check if a directory or file exists.
 * @param {string} path - Absolute or relative path to check.
 * @returns {Promise<boolean>}
 */
async function exists(path) {
	try {
		await fs.access(path);
		return true;
	} catch {
		return false;
	}
}

module.exports = {
	copyDirectory,
	readJson,
	writeJson,
	exists,
	getCoreDir,
};
