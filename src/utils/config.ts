import path from "path";
import inquirer from "inquirer";
import type { Answers, Question } from "inquirer";
import chalk from "chalk";
import fs from "fs-extra";
import { exists } from "./fileOperations";
import { buildCodingStandardsPrompt } from "./prompts";

export interface DocsSubdirs {
	[key: string]: string;
}

export interface DocsConfig {
	dir: string;
	subdirs: DocsSubdirs;
}

export interface ProjectConfig {
	name?: string;
	type?: string;
	dir?: string;
	backendDir?: string;
	frontendDir?: string;
	testDirs?: string[];
}

export interface BmadConfig {
	baseDir?: string;
	project?: ProjectConfig;
	docs: DocsConfig;
	[key: string]: unknown;
}

export interface ConfigAnswers extends Answers {
	projectName?: string;
	isMonolithic?: boolean;
	dir?: string;
	frontendDir?: string;
	backendDir?: string;
	testDirs?: string[];
	baseDir?: string;
	docsDir?: string;
	projectType?: string;
}

export type ConfigQuestion = Question<ConfigAnswers> & { accessKey?: string };

const DEFAULT_DOCS_CONFIG: DocsConfig = {
	dir: "docs",
	subdirs: {
		qa: "qa",
		epics: "epics",
		stories: "stories",
	},
};

interface ConfigLocation {
	dir: string;
	path: string;
}

export async function findConfig(cwd: string): Promise<ConfigLocation | null> {
	const possibleDirs = ["bmad-minimal", ".bmad", "bmad"];
	for (const dir of possibleDirs) {
		const configPath = path.join(cwd, dir, "config.json");
		try {
			await fs.access(configPath);
			return { dir, path: configPath };
		} catch {}
	}
	return null;
}

export async function loadDefaultConfig(coreDir: string): Promise<BmadConfig> {
	const defaultConfigPath = path.join(coreDir, "config.json");
	const config = (await fs.readJson(defaultConfigPath)) as BmadConfig;
	return ensureDocsDefaults(config);
}

export function mergeConfig(
	defaultConfig: BmadConfig,
	answers: ConfigAnswers
): BmadConfig {
	const cfg: BmadConfig = JSON.parse(JSON.stringify(defaultConfig));
	ensureDocsDefaults(cfg);

	if (answers.baseDir) cfg.baseDir = answers.baseDir;
	cfg.project = cfg.project || {};

	if (answers.projectName) cfg.project.name = answers.projectName;
	if (answers.projectType) cfg.project.type = answers.projectType;
	if (answers.dir !== undefined) cfg.project.dir = answers.dir ?? "";
	if (answers.backendDir !== undefined)
		cfg.project.backendDir = answers.backendDir ?? "";
	if (answers.frontendDir !== undefined)
		cfg.project.frontendDir = answers.frontendDir ?? "";
	if (Array.isArray(answers.testDirs)) {
		cfg.project.testDirs = answers.testDirs;
	}

	if (!cfg.docs) {
		cfg.docs = { ...DEFAULT_DOCS_CONFIG };
	}
	if (answers.docsDir) cfg.docs.dir = answers.docsDir;

	return ensureDocsDefaults(cfg);
}

export function ensureDocsDefaults<T extends BmadConfig | null | undefined>(
	config: T
): T {
	if (!config || typeof config !== "object") {
		return config;
	}

	if (!config.docs || typeof config.docs !== "object") {
		config.docs = { ...DEFAULT_DOCS_CONFIG };
	}

	if (!config.docs.dir || typeof config.docs.dir !== "string") {
		config.docs.dir = DEFAULT_DOCS_CONFIG.dir;
	} else {
		config.docs.dir = config.docs.dir.trim() || DEFAULT_DOCS_CONFIG.dir;
	}

	if (!config.docs.subdirs || typeof config.docs.subdirs !== "object") {
		config.docs.subdirs = { ...DEFAULT_DOCS_CONFIG.subdirs };
	} else {
		for (const [key, value] of Object.entries(DEFAULT_DOCS_CONFIG.subdirs)) {
			const current = config.docs.subdirs[key];
			if (typeof current !== "string" || current.trim() === "") {
				config.docs.subdirs[key] = value;
			} else {
				config.docs.subdirs[key] = current.trim();
			}
		}
	}

	return config;
}

export function getConfigFields(
	cwd: string,
	options?: { project?: string; dir?: string }
): ConfigQuestion[] {
	return [
		{
			type: "input",
			name: "projectName",
			accessKey: "project.name",
			message: "Project name:",
			default: path.basename(cwd),
			validate: (input: string) =>
				input.trim() !== "" || "Project name is required",
			when: () => !options?.project,
		},
		{
			type: "confirm",
			name: "isMonolithic",
			message:
				"Is this a monolithic app (everything happens in one place with no backend/frontend separation)?",
		},
		{
			type: "input",
			name: "dir",
			accessKey: "project.dir",
			message: "Monolithic app directory (relative to current directory):",
			default: () => "./",
			when: (answers: ConfigAnswers) => answers.isMonolithic === true,
		},
		{
			type: "input",
			name: "frontendDir",
			accessKey: "project.frontendDir",
			message: "Frontend directory (relative to current directory):",
			default: () => "./frontend/",
			when: (answers: ConfigAnswers) => answers.isMonolithic === false,
		},
		{
			type: "input",
			name: "backendDir",
			accessKey: "project.backendDir",
			message: "Backend directory (relative to current directory):",
			default: () => "./backend/",
			when: (answers: ConfigAnswers) => answers.isMonolithic === false,
		},
		{
			type: "input",
			name: "testDirs",
			accessKey: "project.testDirs",
			message:
				"Test directories (comma-separated, relative to current directory):",
			default: "None",
			filter: (input: string) => {
				if (input.toLowerCase() === "none") {
					return [];
				}
				return input
					.split(",")
					.map((dir) => dir.trim())
					.filter((dir) => dir.length > 0);
			},
		},
		{
			type: "input",
			name: "baseDir",
			accessKey: "baseDir",
			message: "Base directory for BMad files:",
			default: options?.dir || "bmad-minimal",
		},
		{
			type: "input",
			name: "docsDir",
			accessKey: "docs.dir",
			message: "Documentation directory:",
			default: "docs",
		},
	];
}

export async function shouldGenerateCSPrompt(
	configData: BmadConfig
): Promise<void> {
	const docsDir = configData.docs?.dir ?? DEFAULT_DOCS_CONFIG.dir;
	const codingStdsPath = path.join(docsDir, "coding-standards.md");
	const project = configData.project || {};

	if (!(await exists(codingStdsPath))) {
		console.log(chalk.gray("  Writing coding standards template..."));
		const templateTechPrefsPath = path.join(
			__dirname,
			"../templates/coding-standards.md"
		);
		await fs.copy(templateTechPrefsPath, codingStdsPath);

		const { generateCSPrompt } = await inquirer.prompt([
			{
				type: "confirm",
				name: "generateCSPrompt",
				message: "Generate coding standards prompt?",
				default: true,
			},
		]);

		if (generateCSPrompt) {
			const llmPrompt = buildCodingStandardsPrompt({
				projectName: project.name ?? "",
				docsDir,
				projectDir: project.dir,
				backendDir: project.backendDir,
				frontendDir: project.frontendDir,
			});

			console.log("\n" + chalk.cyan("Prompt for your LLM/agent (copy/paste):"));
			console.log(llmPrompt + "\n");
		}
	}
}
