const fs = require("fs-extra");
const path = require("path");

const PRD_FILENAME_PREFIX = "prd-";
const PRD_FILENAME_SUFFIX = ".md";
const PRD_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizePrdSlug(raw) {
	if (typeof raw !== "string") return "";
	let slug = raw.trim().toLowerCase();
	slug = slug.replace(/[\s_]+/g, "-");
	slug = slug.replace(/[^a-z0-9-]/g, "-");
	slug = slug.replace(/-+/g, "-");
	slug = slug.replace(/^-+/, "").replace(/-+$/, "");
	return slug;
}

function isValidPrdSlug(slug) {
	if (typeof slug !== "string" || slug.trim() === "") return false;
	return PRD_SLUG_PATTERN.test(slug);
}

function ensurePrdFilename(slug) {
	const normalized = normalizePrdSlug(slug);
	if (!isValidPrdSlug(normalized)) {
		throw new Error(`Invalid PRD slug: ${slug}`);
	}
	return `${PRD_FILENAME_PREFIX}${normalized}${PRD_FILENAME_SUFFIX}`;
}

function extractPrdSlug(filename) {
	if (!filename.startsWith(PRD_FILENAME_PREFIX) || !filename.endsWith(PRD_FILENAME_SUFFIX)) {
		return null;
	}
	const slug = filename.slice(
		PRD_FILENAME_PREFIX.length,
		filename.length - PRD_FILENAME_SUFFIX.length
	);
	return isValidPrdSlug(slug) ? slug : null;
}

async function listPrdFiles(prdDir) {
	const entries = await fs.readdir(prdDir, { withFileTypes: true }).catch(() => []);
	const files = [];

	for (const entry of entries) {
		if (!entry.isFile()) continue;
		const slug = extractPrdSlug(entry.name);
		if (!slug) continue;
		files.push({
			slug,
			filename: entry.name,
			path: path.join(prdDir, entry.name),
		});
	}

	return files.sort((a, b) => a.slug.localeCompare(b.slug));
}

function getPrdDirectory(cwd, config) {
	const docsDir = config?.docs?.dir ? path.join(cwd, config.docs.dir) : null;
	const prdDirName = config?.docs?.subdirs?.prds;
	if (!docsDir || !prdDirName) {
		throw new Error("Configuration is missing docs.dir or docs.subdirs.prds");
	}
	return path.join(docsDir, prdDirName);
}

module.exports = {
	normalizePrdSlug,
	isValidPrdSlug,
	ensurePrdFilename,
	extractPrdSlug,
	listPrdFiles,
	getPrdDirectory,
	PRD_FILENAME_PREFIX,
	PRD_FILENAME_SUFFIX,
};