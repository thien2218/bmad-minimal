const fs = require("fs-extra");
const path = require("path");

/**
 * Generate technical preferences content based on project metadata
 */
async function generateTechnicalPreferences(metadata) {
	const { languages, libraries, testFrameworks, packageManager } = metadata;

	// Read the base template
	const templatePath = path.join(
		__dirname,
		"../templates/technical-preferences.md"
	);
	let content = await fs.readFile(templatePath, "utf-8");

	// Generate supporting content
	const projectStructureContent = generateProjectStructureContent(
		languages,
		packageManager
	);
	const testingContent = generateTestingContent(languages, testFrameworks);

	// Replace placeholders by keys only when we have a non-falsy value.
	const langLine = humanizeLanguages(languages);
	const testingLine = testingContent.tools || null;

	content = replaceTbdForKey(content, "Language(s)", langLine);
	content = replaceTbdForKey(
		content,
		"Frontend",
		libraries.frontend.join(", ")
	);
	content = replaceTbdForKey(content, "Backend", libraries.backend.join(", "));
	content = replaceTbdForKey(content, "Testing", testingLine);

	// Project structure and package management
	content = replaceTbdForKey(
		content,
		"Repo model",
		projectStructureContent.repoModel
	);
	content = replaceTbdForKey(
		content,
		"Directory layout (high-level)",
		projectStructureContent.directories
	);
	content = replaceTbdForKey(
		content,
		"Package manager & version",
		projectStructureContent.packageManager
	);
	content = replaceTbdForKey(
		content,
		"Workspaces",
		projectStructureContent.workspaces
	);

	// Testing strategy details
	content = replaceTbdForKey(content, "Unit tests", testingContent.unitTests);
	content = replaceTbdForKey(
		content,
		"Integration/E2E",
		testingContent.integration
	);
	content = replaceTbdForKey(content, "Quality gates", null);

	return content;
}

function humanizeLanguages(languages) {
	let content = null;

	const langMap = {
		typescript: "TypeScript",
		javascript: "JavaScript",
		python: "Python",
		rust: "Rust",
		go: "Go",
		zig: "Zig",
		csharp: "C#",
		java: "Java",
		swift: "Swift",
		php: "PHP",
		dart: "Dart",
		ruby: "Ruby",
	};

	// Handle multiple languages
	if (languages.length > 1) {
		const langList = languages.map((lang) => langMap[lang] || lang);
		content = langList.join(", ");
	} else {
		if (languages.includes("typescript")) {
			content = langMap["typescript"];
		} else if (languages.includes("javascript")) {
			content = langMap["javascript"];
		} else if (languages.includes("python")) {
			content = langMap["python"];
		} else if (languages.includes("rust")) {
			content = langMap["rust"];
		} else if (languages.includes("go")) {
			content = langMap["go"];
		} else if (languages.includes("zig")) {
			content = langMap["zig"];
		} else if (languages.includes("csharp")) {
			content = langMap["csharp"];
		} else if (languages.includes("java")) {
			content = langMap["java"];
		} else if (languages.includes("swift")) {
			content = langMap["swift"];
		} else if (languages.includes("php")) {
			content = langMap["php"];
		} else if (languages.includes("dart")) {
			content = langMap["dart"];
		} else if (languages.includes("ruby")) {
			content = langMap["ruby"];
		}
	}

	return content;
}

function generateProjectStructureContent(languages, packageManager) {
	const content = {
		repoModel: "polyrepo",
		directories: null,
		packageManager,
		workspaces: "no",
	};

	if (languages.includes("typescript") || languages.includes("javascript")) {
		content.directories = "src/, tests/, docs/, scripts/";
		if (!packageManager) content.packageManager = "npm";
	} else if (languages.includes("python")) {
		content.directories = "src/, tests/, docs/, scripts/";
		content.packageManager = "pip/poetry/pipenv";
	} else if (languages.includes("rust")) {
		content.directories = "src/, tests/, docs/, benches/";
		content.packageManager = "cargo";
	} else if (languages.includes("go")) {
		content.directories = "cmd/, pkg/, internal/, docs/";
		content.packageManager = "go modules";
	} else if (languages.includes("zig")) {
		content.directories = "src/, test/, docs/";
		content.packageManager = "zig build system";
	} else if (languages.includes("csharp")) {
		content.directories = "src/, tests/, docs/";
		content.packageManager = "NuGet";
	} else if (languages.includes("java")) {
		content.directories = "src/main/, src/test/, docs/";
		content.packageManager = "Maven/Gradle";
	} else if (languages.includes("swift")) {
		content.directories = "Sources/, Tests/, docs/";
		content.packageManager = "Swift Package Manager";
	} else if (languages.includes("php")) {
		content.directories = "src/, tests/, docs/, public/";
		content.packageManager = "Composer";
	} else if (languages.includes("dart")) {
		content.directories = "lib/, test/, docs/";
		content.packageManager = "pub";
	} else if (languages.includes("ruby")) {
		content.directories = "lib/, spec/, docs/";
		content.packageManager = "Bundler/RubyGems";
	}

	return content;
}

function generateTestingContent(languages, testFrameworks) {
	const content = {
		tools: null,
		unitTests: null,
		integration: null,
	};

	if (testFrameworks.length > 0) {
		content.tools = testFrameworks.join(", ");
	}

	if (languages.includes("typescript") || languages.includes("javascript")) {
		content.tools = content.tools || "Jest/Vitest; E2E: Playwright";
		content.unitTests = "Jest/Vitest; coverage target: 80%";
		content.integration = "Playwright for E2E; Docker Compose for services";
	} else if (languages.includes("python")) {
		content.tools = content.tools || "pytest; E2E: Selenium/Playwright";
		content.unitTests = "pytest; coverage target: 80%";
		content.integration = "pytest with fixtures; Docker for services";
	} else if (languages.includes("rust")) {
		content.tools = content.tools || "built-in testing; cargo test";
		content.unitTests = "cargo test; coverage via tarpaulin";
		content.integration = "integration tests in tests/";
	} else if (languages.includes("go")) {
		content.tools = content.tools || "go test; testify for assertions";
		content.unitTests = "go test; coverage target: 80%";
		content.integration = "go test with build tags";
	} else if (languages.includes("zig")) {
		content.tools = content.tools || "built-in test framework";
		content.unitTests = "zig test; built-in coverage";
		content.integration = "test blocks in source files";
	} else if (languages.includes("csharp")) {
		content.tools = content.tools || "xUnit/NUnit; SpecFlow for BDD";
		content.unitTests = "xUnit; coverage target: 80%";
		content.integration = "TestServer for integration tests";
	} else if (languages.includes("java")) {
		content.tools = content.tools || "JUnit 5; Mockito; AssertJ";
		content.unitTests = "JUnit 5; coverage via JaCoCo: 80%";
		content.integration = "Spring Boot Test; TestContainers";
	} else if (languages.includes("swift")) {
		content.tools = content.tools || "XCTest; Quick/Nimble";
		content.unitTests = "XCTest; coverage target: 80%";
		content.integration = "XCUITest for UI tests";
	} else if (languages.includes("php")) {
		content.tools = content.tools || "PHPUnit; Behat for BDD";
		content.unitTests = "PHPUnit; coverage target: 80%";
		content.integration = "PHPUnit with database fixtures";
	} else if (languages.includes("dart")) {
		content.tools = content.tools || "dart test; mockito";
		content.unitTests = "dart test; coverage target: 80%";
		content.integration = "integration_test package";
	} else if (languages.includes("ruby")) {
		content.tools = content.tools || "RSpec; Capybara for E2E";
		content.unitTests = "RSpec; coverage via SimpleCov: 80%";
		content.integration = "RSpec with database cleaner";
	}

	return content;
}

// Replace only the 'TBD' and any following inline comment for a given key
function replaceTbdForKey(content, key, value) {
	if (!value) return content;
	const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const re = new RegExp(
		`(^\\s*-\\s*${esc}\\s*:\\s*)TBD(\\s*(?:<!--[^>]*-->)?)`,
		"mi"
	);
	return content.replace(re, (_, p1) => `${p1}${value}`);
}

module.exports = {
	generateTechnicalPreferences,
};
