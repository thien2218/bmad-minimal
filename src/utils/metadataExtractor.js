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
		libraries: [],
		testFrameworks: [],
		buildTools: [],
		packageManager: null,
	};

	// Package manager (JS/TS only for now)
	if (languages.includes("javascript") || languages.includes("typescript")) {
		metadata.packageManager = await getPackageManager(projectPath);
	}

	// Extract libraries via helper
	metadata.libraries = await extractLibrariesFromProject(
		projectPath,
		languages
	);

	// Derive test frameworks and build tools from libraries where applicable
	if (languages.includes("javascript") || languages.includes("typescript")) {
		const libs = new Set(metadata.libraries.map((l) => l.toLowerCase()));
		// Test frameworks
		if (libs.has("jest")) metadata.testFrameworks.push("Jest");
		if (libs.has("vitest")) metadata.testFrameworks.push("Vitest");
		if (libs.has("mocha")) metadata.testFrameworks.push("Mocha");
		if (libs.has("playwright")) metadata.testFrameworks.push("Playwright");
		if (libs.has("cypress")) metadata.testFrameworks.push("Cypress");
		// Build tools
		if (libs.has("vite")) metadata.buildTools.push("Vite");
		if (libs.has("webpack")) metadata.buildTools.push("Webpack");
		if (libs.has("esbuild")) metadata.buildTools.push("esbuild");
		if (libs.has("@swc/core")) metadata.buildTools.push("SWC");
	}

	if (languages.includes("python")) {
		// Detect pytest from libraries
		if (metadata.libraries.some((l) => l.toLowerCase() === "pytest")) {
			metadata.testFrameworks.push("pytest");
		}
	}

	return metadata;
}

/**
 * Extract library names from a project for the given languages
 */
async function extractLibrariesFromProject(projectPath, languages) {
	const libs = new Set();

	if (languages.includes("javascript") || languages.includes("typescript")) {
		const packageJsonPath = path.join(projectPath, "package.json");

		if (await fs.pathExists(packageJsonPath)) {
			const packageJson = await fs.readJson(packageJsonPath);
			const deps = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};
			Object.keys(deps || {}).forEach((name) => libs.add(name));
		}
	}

	if (languages.includes("python")) {
		// requirements.txt
		const requirementsPath = path.join(projectPath, "requirements.txt");

		if (await fs.pathExists(requirementsPath)) {
			const requirements = await fs.readFile(requirementsPath, "utf-8");
			const lines = requirements
				.split("\n")
				.filter((line) => line.trim() && !line.startsWith("#"));

			for (const line of lines) {
				const packageName = line.split(/[<>=!~]/)[0].trim();
				if (packageName) libs.add(packageName);
			}
		}

		// Pipfile
		const pipfilePath = path.join(projectPath, "Pipfile");

		if (await fs.pathExists(pipfilePath)) {
			const pipfile = await fs.readFile(pipfilePath, "utf-8");
			const packageMatches = pipfile.match(/^([a-zA-Z0-9-_]+)\s*=/gm);

			if (packageMatches) {
				for (const match of packageMatches) {
					const packageName = match.replace(/\s*=.*/, "").trim();
					libs.add(packageName);
				}
			}
		}

		// pyproject.toml
		const pyprojectPath = path.join(projectPath, "pyproject.toml");

		if (await fs.pathExists(pyprojectPath)) {
			const pyproject = await fs.readFile(pyprojectPath, "utf-8");
			const depMatches = pyproject.match(/dependencies\s*=\s*\[([^\]]+)\]/s);

			if (depMatches) {
				const depList = depMatches[1].match(/"([^"]+)"/g);

				if (depList) {
					for (const dep of depList) {
						const packageName = dep
							.replace(/"/g, "")
							.split(/[<>=!~]/)[0]
							.trim();
						libs.add(packageName);
					}
				}
			}
		}
	}

	if (languages.includes("go")) {
		const goModPath = path.join(projectPath, "go.mod");

		if (await fs.pathExists(goModPath)) {
			const goMod = await fs.readFile(goModPath, "utf-8");
			const requireBlock = goMod.match(/require\s*\(([^)]+)\)/s);

			if (requireBlock) {
				const requires = requireBlock[1].match(/([^\s]+)\s+v[^\s]+/g);

				if (requires) {
					for (const req of requires) libs.add(req.split(/\s+/)[0]);
				}
			}

			const singleRequires = goMod.match(/^require\s+([^\s]+)/gm);
			if (singleRequires) {
				for (const req of singleRequires)
					libs.add(req.replace(/^require\s+/, "").split(/\s+/)[0]);
			}
		}
	}

	if (languages.includes("rust")) {
		const cargoTomlPath = path.join(projectPath, "Cargo.toml");

		if (await fs.pathExists(cargoTomlPath)) {
			const cargoToml = await fs.readFile(cargoTomlPath, "utf-8");
			const depSection = cargoToml.match(/\[dependencies\]([^\[]+)/s);

			if (depSection) {
				const deps = depSection[1].match(/^([a-zA-Z0-9-_]+)\s*=/gm);
				if (deps)
					deps.forEach((d) => libs.add(d.replace(/\s*=.*/, "").trim()));
			}

			const devDepSection = cargoToml.match(/\[dev-dependencies\]([^\[]+)/s);

			if (devDepSection) {
				const deps = devDepSection[1].match(/^([a-zA-Z0-9-_]+)\s*=/gm);
				if (deps)
					deps.forEach((d) => libs.add(d.replace(/\s*=.*/, "").trim()));
			}
		}
	}

	if (languages.includes("java")) {
		const pomPath = path.join(projectPath, "pom.xml");

		if (await fs.pathExists(pomPath)) {
			const pom = await fs.readFile(pomPath, "utf-8");
			const artifactIds = pom.match(/<artifactId>([^<]+)<\/artifactId>/g);

			if (artifactIds) {
				for (const a of artifactIds) {
					const name = a.replace(/<\/?artifactId>/g, "");
					if (name !== "maven-compiler-plugin") libs.add(name);
				}
			}
		}

		const gradlePath = path.join(projectPath, "build.gradle");

		if (await fs.pathExists(gradlePath)) {
			const gradle = await fs.readFile(gradlePath, "utf-8");
			const depMatches = gradle.match(/['"]([^:]+:[^:]+:[^'"]+)['"]/g);

			if (depMatches) {
				for (const dep of depMatches) {
					const parts = dep.replace(/["']/g, "").split(":");
					if (parts.length >= 2) libs.add(parts[1]);
				}
			}
		}
	}

	if (languages.includes("php")) {
		const composerJsonPath = path.join(projectPath, "composer.json");

		if (await fs.pathExists(composerJsonPath)) {
			const composerJson = await fs.readJson(composerJsonPath);
			const deps = {
				...composerJson.require,
				...composerJson["require-dev"],
			};

			Object.keys(deps || {})
				.filter((k) => !k.startsWith("php") && !k.startsWith("ext-"))
				.forEach((k) => libs.add(k));
		}
	}

	if (languages.includes("ruby")) {
		const gemfilePath = path.join(projectPath, "Gemfile");

		if (await fs.pathExists(gemfilePath)) {
			const gemfile = await fs.readFile(gemfilePath, "utf-8");
			const gemMatches = gemfile.match(/gem\s+['"]([^'"]+)['"]/g);

			if (gemMatches) {
				for (const gem of gemMatches) {
					const m = gem.match(/['"]([^'"]+)['"]/);
					if (m) libs.add(m[1]);
				}
			}
		}
	}

	if (languages.includes("dart")) {
		const pubspecPath = path.join(projectPath, "pubspec.yaml");

		if (await fs.pathExists(pubspecPath)) {
			const pubspec = await fs.readFile(pubspecPath, "utf-8");
			const depSection = pubspec.match(
				/dependencies:([^:]+)(dev_dependencies:|$)/s
			);

			if (depSection) {
				const deps = depSection[1].match(/^\s+([a-zA-Z0-9_]+):/gm);
				if (deps) deps.forEach((d) => libs.add(d.trim().replace(":", "")));
			}
		}
	}

	if (languages.includes("swift")) {
		const packageSwiftPath = path.join(projectPath, "Package.swift");

		if (await fs.pathExists(packageSwiftPath)) {
			const packageSwift = await fs.readFile(packageSwiftPath, "utf-8");
			const depMatches = packageSwift.match(
				/\.package\(.*?name:\s*"([^"]+)"/g
			);

			if (depMatches) {
				for (const dep of depMatches) {
					const nameMatch = dep.match(/name:\s*"([^"]+)"/);
					if (nameMatch) libs.add(nameMatch[1]);
				}
			}
		}
	}

	if (languages.includes("zig")) {
		const buildZonPath = path.join(projectPath, "build.zig.zon");

		if (await fs.pathExists(buildZonPath)) {
			const buildZon = await fs.readFile(buildZonPath, "utf-8");
			const depSection = buildZon.match(
				/\.dependencies\s*=\s*\.\{([^}]+)\}/s
			);

			if (depSection) {
				const deps = depSection[1].match(/\.([a-zA-Z0-9_-]+)\s*=/g);
				if (deps)
					deps.forEach((d) =>
						libs.add(d.replace(/^\.|\s*=.*/g, "").trim())
					);
			}
		}
	}

	return Array.from(libs).sort();
}

module.exports = {
	detectLanguages,
	getPackageManager,
	getProjectMetadata,
};
