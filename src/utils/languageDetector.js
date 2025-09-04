const fs = require("fs-extra");
const path = require("path");

/**
 * Detect project languages based on file patterns
 */
async function detectLanguages(projectPath) {
	const languages = new Set();
	const detectionRules = [
		{
			language: "typescript",
			files: ["tsconfig.json", "tsconfig.*.json"],
			extensions: [".ts", ".tsx"],
		},
		{
			language: "javascript",
			files: ["package.json", ".npmrc"],
			extensions: [".js", ".jsx", ".mjs", ".cjs"],
		},
		{
			language: "python",
			files: [
				"requirements.txt",
				"Pipfile",
				"pyproject.toml",
				"setup.py",
				"setup.cfg",
			],
			extensions: [".py", ".pyi"],
		},
		{
			language: "rust",
			files: ["Cargo.toml", "Cargo.lock"],
			extensions: [".rs"],
		},
		{
			language: "go",
			files: ["go.mod", "go.sum"],
			extensions: [".go"],
		},
		{
			language: "zig",
			files: ["build.zig", "build.zig.zon"],
			extensions: [".zig"],
		},
		{
			language: "csharp",
			files: ["*.csproj", "*.sln", "global.json"],
			extensions: [".cs", ".csx"],
		},
		{
			language: "java",
			files: [
				"pom.xml",
				"build.gradle",
				"build.gradle.kts",
				"settings.gradle",
			],
			extensions: [".java"],
		},
		{
			language: "swift",
			files: ["Package.swift", "*.xcodeproj", "*.xcworkspace"],
			extensions: [".swift"],
		},
		{
			language: "php",
			files: ["composer.json", "composer.lock"],
			extensions: [".php"],
		},
		{
			language: "dart",
			files: ["pubspec.yaml", "pubspec.lock"],
			extensions: [".dart"],
		},
		{
			language: "ruby",
			files: ["Gemfile", "Gemfile.lock", "*.gemspec"],
			extensions: [".rb", ".rake"],
		},
	];

	try {
		// Check for configuration files
		for (const rule of detectionRules) {
			for (const filePattern of rule.files) {
				if (filePattern.includes("*")) {
					// Handle wildcards
					const files = await fs.readdir(projectPath).catch(() => []);
					const regex = new RegExp(
						"^" + filePattern.replace("*", ".*") + "$"
					);
					if (files.some((file) => regex.test(file))) {
						languages.add(rule.language);
						break;
					}
				} else {
					// Direct file check
					const filePath = path.join(projectPath, filePattern);
					if (await fs.pathExists(filePath)) {
						languages.add(rule.language);
						break;
					}
				}
			}
		}

		// If no config files found, check for source files
		if (languages.size === 0) {
			const files = await getAllFiles(projectPath);
			for (const file of files) {
				const ext = path.extname(file);
				for (const rule of detectionRules) {
					if (rule.extensions.includes(ext)) {
						languages.add(rule.language);
					}
				}
			}
		}

		// TypeScript is a superset of JavaScript, handle this case
		if (languages.has("typescript")) {
			languages.add("javascript");
		}

		return Array.from(languages);
	} catch (error) {
		console.warn(
			"Warning: Could not detect project languages:",
			error.message
		);
		return [];
	}
}

/**
 * Get all files in directory recursively
 */
async function getAllFiles(dir, fileList = [], maxDepth = 3, currentDepth = 0) {
	if (currentDepth >= maxDepth) return fileList;

	try {
		const files = await fs.readdir(dir, { withFileTypes: true });

		for (const file of files) {
			const filePath = path.join(dir, file.name);

			// Skip node_modules, .git, and other common directories
			if (
				[
					"node_modules",
					".git",
					"dist",
					"build",
					"target",
					".venv",
					"venv",
				].includes(file.name)
			) {
				continue;
			}

			if (file.isDirectory()) {
				await getAllFiles(filePath, fileList, maxDepth, currentDepth + 1);
			} else {
				fileList.push(filePath);
			}
		}
	} catch (error) {
		// Ignore errors for directories we can't read
	}

	return fileList;
}

/**
 * Get package manager for JavaScript/TypeScript projects
 */
async function getPackageManager(projectPath) {
	const managers = [
		{ name: "pnpm", lockFile: "pnpm-lock.yaml" },
		{ name: "yarn", lockFile: "yarn.lock" },
		{ name: "npm", lockFile: "package-lock.json" },
	];

	for (const manager of managers) {
		if (await fs.pathExists(path.join(projectPath, manager.lockFile))) {
			return manager.name;
		}
	}

	// Default to npm if package.json exists
	if (await fs.pathExists(path.join(projectPath, "package.json"))) {
		return "npm";
	}

	return null;
}

/**
 * Get project metadata based on detected language
 */
async function getProjectMetadata(projectPath, languages) {
	const metadata = {
		languages,
		frameworks: [],
		testFrameworks: [],
		buildTools: [],
		packageManager: null,
		runtime: null,
	};

	if (languages.includes("javascript") || languages.includes("typescript")) {
		metadata.packageManager = await getPackageManager(projectPath);

		const packageJsonPath = path.join(projectPath, "package.json");
		if (await fs.pathExists(packageJsonPath)) {
			const packageJson = await fs.readJson(packageJsonPath);
			const deps = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};

			// Detect frameworks
			if (deps["react"]) metadata.frameworks.push("React");
			if (deps["vue"]) metadata.frameworks.push("Vue");
			if (deps["@angular/core"]) metadata.frameworks.push("Angular");
			if (deps["next"]) metadata.frameworks.push("Next.js");
			if (deps["express"]) metadata.frameworks.push("Express");
			if (deps["fastify"]) metadata.frameworks.push("Fastify");
			if (deps["@nestjs/core"]) metadata.frameworks.push("NestJS");

			// Detect test frameworks
			if (deps["jest"]) metadata.testFrameworks.push("Jest");
			if (deps["vitest"]) metadata.testFrameworks.push("Vitest");
			if (deps["mocha"]) metadata.testFrameworks.push("Mocha");
			if (deps["playwright"]) metadata.testFrameworks.push("Playwright");
			if (deps["cypress"]) metadata.testFrameworks.push("Cypress");

			// Detect build tools
			if (deps["vite"]) metadata.buildTools.push("Vite");
			if (deps["webpack"]) metadata.buildTools.push("Webpack");
			if (deps["esbuild"]) metadata.buildTools.push("esbuild");
			if (deps["@swc/core"]) metadata.buildTools.push("SWC");
		}

		// Check for Node version
		const nvmrcPath = path.join(projectPath, ".nvmrc");
		const nodeVersionPath = path.join(projectPath, ".node-version");
		if (await fs.pathExists(nvmrcPath)) {
			metadata.runtime = `Node.js ${(
				await fs.readFile(nvmrcPath, "utf-8")
			).trim()}`;
		} else if (await fs.pathExists(nodeVersionPath)) {
			metadata.runtime = `Node.js ${(
				await fs.readFile(nodeVersionPath, "utf-8")
			).trim()}`;
		}
	}

	if (languages.includes("python")) {
		const requirementsPath = path.join(projectPath, "requirements.txt");
		const pipfilePath = path.join(projectPath, "Pipfile");
		const pyprojectPath = path.join(projectPath, "pyproject.toml");

		if (await fs.pathExists(requirementsPath)) {
			const requirements = await fs.readFile(requirementsPath, "utf-8");
			if (requirements.includes("django"))
				metadata.frameworks.push("Django");
			if (requirements.includes("flask")) metadata.frameworks.push("Flask");
			if (requirements.includes("fastapi"))
				metadata.frameworks.push("FastAPI");
			if (requirements.includes("pytest"))
				metadata.testFrameworks.push("pytest");
		}

		// Check for Python version
		const pythonVersionPath = path.join(projectPath, ".python-version");
		if (await fs.pathExists(pythonVersionPath)) {
			metadata.runtime = `Python ${(
				await fs.readFile(pythonVersionPath, "utf-8")
			).trim()}`;
		}
	}

	return metadata;
}

module.exports = {
	detectLanguages,
	getPackageManager,
	getProjectMetadata,
};
