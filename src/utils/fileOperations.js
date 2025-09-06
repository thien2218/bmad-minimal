const fs = require("fs-extra");
const path = require("path");

/**
 * Copy directory recursively
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
 * Read and parse JSON file
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
 * Write JSON file with pretty formatting
 */
async function writeJson(filePath, data) {
	await fs.ensureDir(path.dirname(filePath));
	await fs.writeFile(filePath, JSON.stringify(data, null, "\t"));
}

/**
 * Get the core/ directory
 */
function getCoreDir() {
	const corePath = "../../core";
	return path.join(__dirname, corePath);
}

/**
 * Check if a directory or file exists
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
