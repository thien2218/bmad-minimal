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

	if (languages.includes("javascript") || languages.includes("typescript")) {
		metadata.packageManager = await getPackageManager(projectPath);

		const packageJsonPath = path.join(projectPath, "package.json");
		if (await fs.pathExists(packageJsonPath)) {
			const packageJson = await fs.readJson(packageJsonPath);
			const deps = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};

			// Collect all libraries
			metadata.libraries = Object.keys(deps || {}).sort();

			// Detect test frameworks (keep for specific categorization)
			if (deps["jest"]) metadata.testFrameworks.push("Jest");
			if (deps["vitest"]) metadata.testFrameworks.push("Vitest");
			if (deps["mocha"]) metadata.testFrameworks.push("Mocha");
			if (deps["playwright"]) metadata.testFrameworks.push("Playwright");
			if (deps["cypress"]) metadata.testFrameworks.push("Cypress");

			// Detect build tools (keep for specific categorization)
			if (deps["vite"]) metadata.buildTools.push("Vite");
			if (deps["webpack"]) metadata.buildTools.push("Webpack");
			if (deps["esbuild"]) metadata.buildTools.push("esbuild");
			if (deps["@swc/core"]) metadata.buildTools.push("SWC");
		}

		// Check for Node version
		const nvmrcPath = path.join(projectPath, ".nvmrc");
		const nodeVersionPath = path.join(projectPath, ".node-version");
	}

	if (languages.includes("python")) {
		const libraries = [];

		// Read from requirements.txt
		const requirementsPath = path.join(projectPath, "requirements.txt");
		if (await fs.pathExists(requirementsPath)) {
			const requirements = await fs.readFile(requirementsPath, "utf-8");
			const lines = requirements.split('\n').filter(line => line.trim() && !line.startsWith('#'));
			for (const line of lines) {
				// Extract package name (before any version specifier)
				const packageName = line.split(/[<>=!~]/)[0].trim();
				if (packageName) libraries.push(packageName);
			}

			// Detect test frameworks
			if (requirements.includes("pytest"))
				metadata.testFrameworks.push("pytest");
		}

		// Read from Pipfile
		const pipfilePath = path.join(projectPath, "Pipfile");
		if (await fs.pathExists(pipfilePath) && libraries.length === 0) {
			const pipfile = await fs.readFile(pipfilePath, "utf-8");
			// Simple parsing for [packages] and [dev-packages] sections
			const packageMatches = pipfile.match(/^([a-zA-Z0-9-_]+)\s*=/gm);
			if (packageMatches) {
				for (const match of packageMatches) {
					const packageName = match.replace(/\s*=.*/, '').trim();
					if (!libraries.includes(packageName)) libraries.push(packageName);
				}
			}
		}

		// Read from pyproject.toml
		const pyprojectPath = path.join(projectPath, "pyproject.toml");
		if (await fs.pathExists(pyprojectPath) && libraries.length === 0) {
			const pyproject = await fs.readFile(pyprojectPath, "utf-8");
			// Look for dependencies in various formats
			const depMatches = pyproject.match(/dependencies\s*=\s*\[([^\]]+)\]/s);
			if (depMatches) {
				const deps = depMatches[1].match(/"([^"]+)"/g);
				if (deps) {
					for (const dep of deps) {
						const packageName = dep.replace(/"/g, '').split(/[<>=!~]/)[0].trim();
						if (!libraries.includes(packageName)) libraries.push(packageName);
					}
				}
			}
		}

		metadata.libraries = libraries.sort();
	}

	if (languages.includes("go")) {
		const goModPath = path.join(projectPath, "go.mod");
		if (await fs.pathExists(goModPath)) {
			const goMod = await fs.readFile(goModPath, "utf-8");
			const libraries = [];

			// Extract require statements
			const requireBlock = goMod.match(/require\s*\(([^)]+)\)/s);
			if (requireBlock) {
				const requires = requireBlock[1].match(/([^\s]+)\s+v[^\s]+/g);
				if (requires) {
					for (const req of requires) {
						const packageName = req.split(/\s+/)[0];
						libraries.push(packageName);
					}
				}
			}

			// Also check single-line require statements
			const singleRequires = goMod.match(/^require\s+([^\s]+)/gm);
			if (singleRequires) {
				for (const req of singleRequires) {
					const packageName = req.replace(/^require\s+/, '').split(/\s+/)[0];
					if (!libraries.includes(packageName)) libraries.push(packageName);
				}
			}

			metadata.libraries = libraries.sort();
		}
	}

	if (languages.includes("rust")) {
		const cargoTomlPath = path.join(projectPath, "Cargo.toml");
		if (await fs.pathExists(cargoTomlPath)) {
			const cargoToml = await fs.readFile(cargoTomlPath, "utf-8");
			const libraries = [];

			// Extract dependencies
			const depSection = cargoToml.match(/\[dependencies\]([^\[]+)/s);
			if (depSection) {
				const deps = depSection[1].match(/^([a-zA-Z0-9-_]+)\s*=/gm);
				if (deps) {
					for (const dep of deps) {
						const packageName = dep.replace(/\s*=.*/, '').trim();
						libraries.push(packageName);
					}
				}
			}

			// Extract dev-dependencies
			const devDepSection = cargoToml.match(/\[dev-dependencies\]([^\[]+)/s);
			if (devDepSection) {
				const deps = devDepSection[1].match(/^([a-zA-Z0-9-_]+)\s*=/gm);
				if (deps) {
					for (const dep of deps) {
						const packageName = dep.replace(/\s*=.*/, '').trim();
						if (!libraries.includes(packageName)) libraries.push(packageName);
					}
				}
			}

			metadata.libraries = libraries.sort();
		}
	}

	if (languages.includes("java")) {
		const libraries = [];

		// Check for pom.xml (Maven)
		const pomPath = path.join(projectPath, "pom.xml");
		if (await fs.pathExists(pomPath)) {
			const pom = await fs.readFile(pomPath, "utf-8");
			// Extract artifactId from dependencies
			const artifactIds = pom.match(/<artifactId>([^<]+)<\/artifactId>/g);
			if (artifactIds) {
				for (const artifactId of artifactIds) {
					const name = artifactId.replace(/<\/?artifactId>/g, '');
					if (!libraries.includes(name) && name !== 'maven-compiler-plugin') {
						libraries.push(name);
					}
				}
			}
		}

		// Check for build.gradle (Gradle)
		const gradlePath = path.join(projectPath, "build.gradle");
		if (await fs.pathExists(gradlePath) && libraries.length === 0) {
			const gradle = await fs.readFile(gradlePath, "utf-8");
			// Extract dependencies (simplified parsing)
			const depMatches = gradle.match(/['"]([^:]+:[^:]+:[^'"]+)['"]/g);
			if (depMatches) {
				for (const dep of depMatches) {
					const parts = dep.replace(/['"]/g, '').split(':');
					if (parts.length >= 2) {
						const name = parts[1]; // Get artifact ID
						if (!libraries.includes(name)) libraries.push(name);
					}
				}
			}
		}

		metadata.libraries = libraries.sort();
	}

	if (languages.includes("csharp")) {
		const libraries = [];

		// Look for .csproj files
		const files = await fs.readdir(projectPath).catch(() => []);
		const csprojFiles = files.filter(f => f.endsWith('.csproj'));

		for (const csprojFile of csprojFiles) {
			const csprojPath = path.join(projectPath, csprojFile);
			const csproj = await fs.readFile(csprojPath, "utf-8");

			// Extract PackageReference
			const packageRefs = csproj.match(/<PackageReference\s+Include="([^"]+)"/g);
			if (packageRefs) {
				for (const ref of packageRefs) {
					const packageName = ref.match(/Include="([^"]+)"/)[1];
					if (!libraries.includes(packageName)) libraries.push(packageName);
				}
			}
		}

		metadata.libraries = libraries.sort();
	}

	if (languages.includes("php")) {
		const composerJsonPath = path.join(projectPath, "composer.json");
		if (await fs.pathExists(composerJsonPath)) {
			const composerJson = await fs.readJson(composerJsonPath);
			const deps = { ...composerJson.require, ...composerJson['require-dev'] };

			// Filter out PHP version and extensions
			metadata.libraries = Object.keys(deps || {})
				.filter(key => !key.startsWith('php') && !key.startsWith('ext-'))
				.sort();
		}
	}

	if (languages.includes("ruby")) {
		const libraries = [];

		const gemfilePath = path.join(projectPath, "Gemfile");
		if (await fs.pathExists(gemfilePath)) {
			const gemfile = await fs.readFile(gemfilePath, "utf-8");
			// Extract gem declarations
			const gemMatches = gemfile.match(/gem\s+['"]([^'"]+)['"]/g);
			if (gemMatches) {
				for (const gem of gemMatches) {
					const gemName = gem.match(/['"]([^'"]+)['"]/);
					if (gemName) libraries.push(gemName[1]);
				}
			}
			metadata.libraries = libraries.sort();
		}
	}

	if (languages.includes("dart")) {
		const pubspecPath = path.join(projectPath, "pubspec.yaml");
		if (await fs.pathExists(pubspecPath)) {
			const pubspec = await fs.readFile(pubspecPath, "utf-8");
			const libraries = [];

			// Extract dependencies (simplified YAML parsing)
			const depSection = pubspec.match(/dependencies:([^:]+)(dev_dependencies:|$)/s);
			if (depSection) {
				const deps = depSection[1].match(/^\s+([a-zA-Z0-9_]+):/gm);
				if (deps) {
					for (const dep of deps) {
						const packageName = dep.trim().replace(':', '');
						libraries.push(packageName);
					}
				}
			}

			metadata.libraries = libraries.sort();
		}
	}

	if (languages.includes("swift")) {
		const packageSwiftPath = path.join(projectPath, "Package.swift");
		if (await fs.pathExists(packageSwiftPath)) {
			const packageSwift = await fs.readFile(packageSwiftPath, "utf-8");
			const libraries = [];

			// Extract package dependencies
			const depMatches = packageSwift.match(/\.package\(.*?name:\s*"([^"]+)"/g);
			if (depMatches) {
				for (const dep of depMatches) {
					const nameMatch = dep.match(/name:\s*"([^"]+)"/);
					if (nameMatch) libraries.push(nameMatch[1]);
				}
			}

			metadata.libraries = libraries.sort();
		}
	}

	if (languages.includes("zig")) {
		const buildZonPath = path.join(projectPath, "build.zig.zon");
		if (await fs.pathExists(buildZonPath)) {
			const buildZon = await fs.readFile(buildZonPath, "utf-8");
			const libraries = [];

			// Extract dependencies from .dependencies section
			const depSection = buildZon.match(/\.dependencies\s*=\s*\.\{([^}]+)\}/s);
			if (depSection) {
				const deps = depSection[1].match(/\.([a-zA-Z0-9_-]+)\s*=/g);
				if (deps) {
					for (const dep of deps) {
						const packageName = dep.replace(/^\.|\s*=.*/g, '').trim();
						libraries.push(packageName);
					}
				}
			}

			metadata.libraries = libraries.sort();
		}
	}

	return metadata;
}

module.exports = {
	detectLanguages,
	getPackageManager,
	getProjectMetadata,
};
