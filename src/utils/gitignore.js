const fs = require("fs-extra");
const path = require("path");

/**
 * Ensure an entry is present in .gitignore at the given repository root.
 * Performs a simple, idempotent append of the entry (or entry/),
 * avoiding duplicates and preserving a trailing newline.
 *
 * @param {Object} params
 * @param {string} params.cwd - The repository root directory.
 * @param {string} params.entry - The path (relative to cwd) to ignore, e.g., "bmad-minimal".
 * @returns {Promise<boolean>} Resolves true if .gitignore was modified, false if already present or no entry provided.
 */
async function ensureIgnored({ cwd, entry }) {
	const trimmed = String(entry || "").trim();
	if (!trimmed) return false;

	const gitignorePath = path.join(cwd, ".gitignore");
	let content = "";
	try {
		content = await fs.readFile(gitignorePath, "utf-8");
	} catch (e) {
		if (e.code !== "ENOENT") throw e; // if not found, we'll create/append
	}

	const lines = content
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter((l) => l.length > 0);
	const already = lines.some((l) => l === trimmed || l === `${trimmed}/`);
	if (already) return false;

	const needsNL = content.length > 0 && !content.endsWith("\n");
	await fs.appendFile(gitignorePath, `${needsNL ? "\n" : ""}${trimmed}\n`);
	return true;
}

module.exports = { ensureIgnored };
