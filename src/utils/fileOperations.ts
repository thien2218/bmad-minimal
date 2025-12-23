import fs from "fs-extra";
import path from "path";

export async function copyDirectory(
	source: string,
	destination: string,
	excludePatterns: string[] = []
): Promise<void> {
	await fs.ensureDir(destination);
	const items = await fs.readdir(source, { withFileTypes: true });

	for (const item of items) {
		const sourcePath = path.join(source, item.name);
		const destPath = path.join(destination, item.name);
		const shouldExclude = excludePatterns.some((pattern) =>
			new RegExp(pattern).test(item.name)
		);

		if (shouldExclude) continue;

		if (item.isDirectory()) {
			await copyDirectory(sourcePath, destPath, excludePatterns);
		} else {
			await fs.copy(sourcePath, destPath, { overwrite: true });
		}
	}
}

export async function readJson<T = unknown>(
	filePath: string
): Promise<T | null> {
	try {
		const content = await fs.readFile(filePath, "utf-8");
		return JSON.parse(content) as T;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return null;
		}
		throw error;
	}
}

export async function writeJson<T>(filePath: string, data: T): Promise<void> {
	await fs.ensureDir(path.dirname(filePath));
	await fs.writeFile(filePath, JSON.stringify(data, null, "\t"));
}

export function getPath(name: string): string {
	return path.join(__dirname, "..", "..", name);
}

export async function exists(targetPath: string): Promise<boolean> {
	try {
		await fs.access(targetPath);
		return true;
	} catch {
		return false;
	}
}
