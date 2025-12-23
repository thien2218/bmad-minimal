import fs from "fs-extra";
import path from "path";

interface EnsureIgnoredParams {
	cwd: string;
	entry?: string;
}

export async function ensureIgnored({
	cwd,
	entry,
}: EnsureIgnoredParams): Promise<boolean> {
	const trimmed = String(entry ?? "").trim();
	if (!trimmed) return false;

	const gitignorePath = path.join(cwd, ".gitignore");
	let content = "";
	try {
		content = await fs.readFile(gitignorePath, "utf-8");
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
			throw error;
		}
	}

	const lines = content
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
	const already = lines.some(
		(line) => line === trimmed || line === `${trimmed}/`
	);
	if (already) return false;

	const needsNewline = content.length > 0 && !content.endsWith("\n");
	await fs.appendFile(gitignorePath, `${needsNewline ? "\n" : ""}${trimmed}\n`);
	return true;
}
