const fs = require("fs-extra");
const path = require("path");

/**
 * Generate technical preferences content based on project metadata
 */
async function generateTechnicalPreferences(metadata) {
	const {
		languages,
		frameworks,
		testFrameworks,
		buildTools,
		packageManager,
		runtime,
	} = metadata;

	// Read the base template
	const templatePath = path.join(
		__dirname,
		"../../core/technical-preferences.md"
	);
	let content = await fs.readFile(templatePath, "utf-8");

	// Generate language-specific content
	const langContent = generateLanguageContent(languages, runtime);
	const frameworkContent = generateFrameworkContent(languages, frameworks);
	const projectStructureContent = generateProjectStructureContent(
		languages,
		packageManager
	);
	const codeQualityContent = generateCodeQualityContent(languages);
	const testingContent = generateTestingContent(languages, testFrameworks);
	const buildContent = generateBuildContent(
		languages,
		buildTools,
		packageManager
	);

	// Replace placeholders in the template
	content = content.replace(
		/<!-- e\.g\., TypeScript 5\.x -->/g,
		langContent.primary || "TBD"
	);
	content = content.replace(
		/<!-- e\.g\., Node\.js 20 LTS; upgrade to next LTS within 60 days -->/g,
		langContent.runtime || "TBD"
	);
	content = content.replace(
		/<!-- e\.g\., TypeScript "strict": true -->/g,
		langContent.typeSettings || "TBD"
	);

	content = content.replace(
		/<!-- e\.g\., React 18, Next\.js 14, UI kit -->/g,
		frameworkContent.frontend || "N/A"
	);
	content = content.replace(
		/<!-- e\.g\., Fastify\/Express\/NestJS; ORM \(Prisma\) -->/g,
		frameworkContent.backend || "TBD"
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

function generateLanguageContent(languages, runtime) {
	const content = {
		primary: null,
		runtime: runtime || null,
		typeSettings: null,
	};

	if (languages.includes("typescript")) {
		content.primary = "TypeScript 5.x";
		content.runtime =
			runtime || "Node.js 20 LTS; upgrade to next LTS within 60 days";
		content.typeSettings = 'TypeScript "strict": true';
	} else if (languages.includes("javascript")) {
		content.primary = "JavaScript (ES2022+)";
		content.runtime =
			runtime || "Node.js 20 LTS; upgrade to next LTS within 60 days";
		content.typeSettings = "JSDoc type annotations where beneficial";
	} else if (languages.includes("python")) {
		content.primary = "Python 3.11+";
		content.runtime =
			runtime || "Python 3.11+; support latest stable Python version";
		content.typeSettings = "Type hints (PEP 484); mypy in strict mode";
	} else if (languages.includes("rust")) {
		content.primary = "Rust (latest stable)";
		content.runtime = "Rust stable channel; update monthly";
		content.typeSettings = "Strict type checking (default)";
	} else if (languages.includes("go")) {
		content.primary = "Go 1.21+";
		content.runtime = "Go 1.21+; support latest two Go versions";
		content.typeSettings = "Static typing (default)";
	} else if (languages.includes("zig")) {
		content.primary = "Zig 0.11+";
		content.runtime = "Zig 0.11+; track stable releases";
		content.typeSettings = "Compile-time type checking";
	} else if (languages.includes("csharp")) {
		content.primary = "C# 12 / .NET 8";
		content.runtime = ".NET 8 LTS";
		content.typeSettings = "Nullable reference types enabled";
	} else if (languages.includes("java")) {
		content.primary = "Java 17 LTS";
		content.runtime = "Java 17 LTS (or Java 21 LTS)";
		content.typeSettings = "Strong typing with generics";
	} else if (languages.includes("swift")) {
		content.primary = "Swift 5.9+";
		content.runtime = "Swift 5.9+; Xcode 15+";
		content.typeSettings = "Swift strict concurrency checking";
	} else if (languages.includes("php")) {
		content.primary = "PHP 8.2+";
		content.runtime = "PHP 8.2+; prefer latest stable";
		content.typeSettings = "Strict types declaration";
	} else if (languages.includes("dart")) {
		content.primary = "Dart 3.0+";
		content.runtime = "Dart 3.0+ stable channel";
		content.typeSettings = "Sound null safety enabled";
	} else if (languages.includes("ruby")) {
		content.primary = "Ruby 3.2+";
		content.runtime = "Ruby 3.2+; support latest stable";
		content.typeSettings = "RBS type signatures where beneficial";
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
		content.primary = langList.join(", ");
	}

	return content;
}

function generateFrameworkContent(languages, frameworks) {
	const content = {
		frontend: null,
		backend: null,
	};

	if (frameworks.length > 0) {
		const frontendFrameworks = frameworks.filter((f) =>
			["React", "Vue", "Angular", "Next.js"].includes(f)
		);
		const backendFrameworks = frameworks.filter((f) =>
			[
				"Express",
				"Fastify",
				"NestJS",
				"Django",
				"Flask",
				"FastAPI",
			].includes(f)
		);

		if (frontendFrameworks.length > 0) {
			content.frontend = frontendFrameworks.join(", ");
		}
		if (backendFrameworks.length > 0) {
			content.backend = backendFrameworks.join(", ");
		}
	}

	// Language-specific defaults if no frameworks detected
	if (!content.backend) {
		if (
			languages.includes("typescript") ||
			languages.includes("javascript")
		) {
			content.backend = "Express/Fastify; ORM: Prisma/TypeORM";
		} else if (languages.includes("python")) {
			content.backend = "FastAPI/Django; ORM: SQLAlchemy/Django ORM";
		} else if (languages.includes("rust")) {
			content.backend = "Axum/Actix; ORM: Diesel/SeaORM";
		} else if (languages.includes("go")) {
			content.backend = "Gin/Echo; ORM: GORM";
		} else if (languages.includes("csharp")) {
			content.backend = "ASP.NET Core; ORM: Entity Framework Core";
		} else if (languages.includes("java")) {
			content.backend = "Spring Boot; ORM: Hibernate/JPA";
		} else if (languages.includes("php")) {
			content.backend = "Laravel/Symfony; ORM: Eloquent/Doctrine";
		} else if (languages.includes("ruby")) {
			content.backend = "Rails/Sinatra; ORM: ActiveRecord";
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

function generateBuildContent(languages, buildTools, packageManager) {
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
