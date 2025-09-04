const fs = require("fs-extra");
const path = require("path");

/**
 * Generate technical preferences content based on project metadata
 */
async function generateTechnicalPreferences(metadata) {
	const {
		languages,
		libraries,
		testFrameworks,
		buildTools,
		packageManager,
	} = metadata;

	// Read the base template
	const templatePath = path.join(
		__dirname,
		"../templates/technical-preferences.md"
	);
	let content = await fs.readFile(templatePath, "utf-8");

	// Generate language-specific content
	const langContent = generateLanguageContent(languages);
	const projectStructureContent = generateProjectStructureContent(
		languages,
		packageManager
	);
	const codeQualityContent = generateCodeQualityContent(languages);
	const testingContent = generateTestingContent(languages, testFrameworks);
	const buildContent = generateBuildContent(languages, buildTools);

	// Replace placeholders in the template
	content = content.replace(
		/<!-- e\.g\., TypeScript 5\.x -->/g,
		langContent || "TBD"
	);
	content = content.replace(
		/<!-- e\.g\., React 18, Next\.js 14, UI kit -->/g,
		libraries.frontend.join(", ") || "N/A"
	);
	content = content.replace(
		/<!-- e\.g\., Fastify\/Express\/NestJS; ORM \(Prisma\) -->/g,
		libraries.backend.join(", ") || "TBD"
	);
	content = content.replace(
		/<!-- e\.g\., Vitest\/Jest; E2E: Playwright\/Cypress -->/g,
		testingContent.tools || "TBD"
	);
	content = content.replace(
		/<!-- e\.g\., Vite, SWC\/esbuild -->/g,
		buildContent.tools || "TBD"
	);

	content = content.replace(
		/<!-- monorepo or polyrepo -->/g,
		projectStructureContent.repoModel || "polyrepo"
	);
	content = content.replace(
		/<!-- e\.g\., apps\/, packages\/, infra\/, docs\/ -->/g,
		projectStructureContent.directories || "src/, tests/, docs/"
	);
	content = content.replace(
		/<!-- pnpm\|npm\|yarn and version -->/g,
		projectStructureContent.packageManager || "TBD"
	);
	content = content.replace(
		/<!-- yes\/no; how to add a new package -->/g,
		projectStructureContent.workspaces || "no"
	);

	content = content.replace(
		/<!-- Prettier\/Black\/gofmt; config link -->/g,
		codeQualityContent.formatter || "TBD"
	);
	content = content.replace(
		/<!-- ESLint\/flake8\/golangci-lint; rule set -->/g,
		codeQualityContent.linter || "TBD"
	);

	content = content.replace(
		/<!-- framework; coverage target \(e\.g\., 80%\) -->/g,
		testingContent.unitTests || "TBD; coverage target: 80%"
	);
	content = content.replace(
		/<!-- tools and environment -->/g,
		testingContent.integration || "TBD"
	);

	return content;
}

function generateLanguageContent(languages) {
	let content = null;

	if (languages.includes("typescript")) {
		content = "TypeScript 5.x";
	} else if (languages.includes("javascript")) {
		content = "JavaScript (ES2022+)";
	} else if (languages.includes("python")) {
		content = "Python 3.11+";
	} else if (languages.includes("rust")) {
		content = "Rust (latest stable)";
	} else if (languages.includes("go")) {
		content = "Go 1.21+";
	} else if (languages.includes("zig")) {
		content = "Zig 0.11+";
	} else if (languages.includes("csharp")) {
		content = "C# 12 / .NET 8";
	} else if (languages.includes("java")) {
		content = "Java 17 LTS";
	} else if (languages.includes("swift")) {
		content = "Swift 5.9+";
	} else if (languages.includes("php")) {
		content = "PHP 8.2+";
	} else if (languages.includes("dart")) {
		content = "Dart 3.0+";
	} else if (languages.includes("ruby")) {
		content = "Ruby 3.2+";
	}

	// Handle multiple languages
	if (languages.length > 1) {
		const langList = languages.map((lang) => {
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
			return langMap[lang] || lang;
		});
		content = langList.join(", ");
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

function generateCodeQualityContent(languages) {
	const content = {
		formatter: null,
		linter: null,
	};

	if (languages.includes("typescript") || languages.includes("javascript")) {
		content.formatter = "Prettier; .prettierrc.json";
		content.linter = "ESLint; recommended + custom rules";
	} else if (languages.includes("python")) {
		content.formatter = "Black; default config";
		content.linter = "flake8/pylint; PEP 8 compliance";
	} else if (languages.includes("rust")) {
		content.formatter = "rustfmt; default config";
		content.linter = "clippy; pedantic level";
	} else if (languages.includes("go")) {
		content.formatter = "gofmt/goimports";
		content.linter = "golangci-lint; recommended presets";
	} else if (languages.includes("zig")) {
		content.formatter = "zig fmt";
		content.linter = "built-in compiler checks";
	} else if (languages.includes("csharp")) {
		content.formatter = "dotnet format";
		content.linter = "Roslyn analyzers";
	} else if (languages.includes("java")) {
		content.formatter = "Google Java Format";
		content.linter = "SpotBugs/Checkstyle";
	} else if (languages.includes("swift")) {
		content.formatter = "swift-format";
		content.linter = "SwiftLint";
	} else if (languages.includes("php")) {
		content.formatter = "PHP CS Fixer";
		content.linter = "PHPStan/Psalm";
	} else if (languages.includes("dart")) {
		content.formatter = "dart format";
		content.linter = "dart analyze";
	} else if (languages.includes("ruby")) {
		content.formatter = "RuboCop formatter";
		content.linter = "RuboCop; standard config";
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

function generateBuildContent(languages, buildTools) {
	const content = {
		tools: null,
	};

	if (buildTools.length > 0) {
		content.tools = buildTools.join(", ");
	}

	if (!content.tools) {
		if (
			languages.includes("typescript") ||
			languages.includes("javascript")
		) {
			content.tools = "Vite/Webpack; esbuild/SWC for transpilation";
		} else if (languages.includes("python")) {
			content.tools = "setuptools/poetry; wheel for distribution";
		} else if (languages.includes("rust")) {
			content.tools = "cargo build; release profile optimization";
		} else if (languages.includes("go")) {
			content.tools = "go build; CGO_ENABLED=0 for static binaries";
		} else if (languages.includes("zig")) {
			content.tools = "zig build; ReleaseSafe mode";
		} else if (languages.includes("csharp")) {
			content.tools = "dotnet build; Release configuration";
		} else if (languages.includes("java")) {
			content.tools = "Maven/Gradle; shade plugin for fat JARs";
		} else if (languages.includes("swift")) {
			content.tools = "swift build; release configuration";
		} else if (languages.includes("php")) {
			content.tools = "Composer; opcache for production";
		} else if (languages.includes("dart")) {
			content.tools = "dart compile; AOT compilation";
		} else if (languages.includes("ruby")) {
			content.tools = "Bundler; rake for tasks";
		}
	}

	return content;
}

module.exports = {
	generateTechnicalPreferences,
};
