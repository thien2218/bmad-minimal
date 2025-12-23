"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findConfig = findConfig;
exports.loadDefaultConfig = loadDefaultConfig;
exports.mergeConfig = mergeConfig;
exports.ensureDocsDefaults = ensureDocsDefaults;
exports.getConfigFields = getConfigFields;
exports.shouldGenerateCSPrompt = shouldGenerateCSPrompt;
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const fileOperations_1 = require("./fileOperations");
const prompts_1 = require("./prompts");
const DEFAULT_DOCS_CONFIG = {
    dir: "docs",
    subdirs: {
        qa: "qa",
        epics: "epics",
        stories: "stories",
    },
};
async function findConfig(cwd) {
    const possibleDirs = ["bmad-minimal", ".bmad", "bmad"];
    for (const dir of possibleDirs) {
        const configPath = path_1.default.join(cwd, dir, "config.json");
        try {
            await fs_extra_1.default.access(configPath);
            return { dir, path: configPath };
        }
        catch { }
    }
    return null;
}
async function loadDefaultConfig(coreDir) {
    const defaultConfigPath = path_1.default.join(coreDir, "config.json");
    const config = (await fs_extra_1.default.readJson(defaultConfigPath));
    return ensureDocsDefaults(config);
}
function mergeConfig(defaultConfig, answers) {
    var _a, _b, _c;
    const cfg = JSON.parse(JSON.stringify(defaultConfig));
    ensureDocsDefaults(cfg);
    if (answers.baseDir)
        cfg.baseDir = answers.baseDir;
    cfg.project = cfg.project || {};
    if (answers.projectName)
        cfg.project.name = answers.projectName;
    if (answers.projectType)
        cfg.project.type = answers.projectType;
    if (answers.dir !== undefined)
        cfg.project.dir = (_a = answers.dir) !== null && _a !== void 0 ? _a : "";
    if (answers.backendDir !== undefined)
        cfg.project.backendDir = (_b = answers.backendDir) !== null && _b !== void 0 ? _b : "";
    if (answers.frontendDir !== undefined)
        cfg.project.frontendDir = (_c = answers.frontendDir) !== null && _c !== void 0 ? _c : "";
    if (Array.isArray(answers.testDirs)) {
        cfg.project.testDirs = answers.testDirs;
    }
    if (!cfg.docs) {
        cfg.docs = { ...DEFAULT_DOCS_CONFIG };
    }
    if (answers.docsDir)
        cfg.docs.dir = answers.docsDir;
    return ensureDocsDefaults(cfg);
}
function ensureDocsDefaults(config) {
    if (!config || typeof config !== "object") {
        return config;
    }
    if (!config.docs || typeof config.docs !== "object") {
        config.docs = { ...DEFAULT_DOCS_CONFIG };
    }
    if (!config.docs.dir || typeof config.docs.dir !== "string") {
        config.docs.dir = DEFAULT_DOCS_CONFIG.dir;
    }
    else {
        config.docs.dir = config.docs.dir.trim() || DEFAULT_DOCS_CONFIG.dir;
    }
    if (!config.docs.subdirs || typeof config.docs.subdirs !== "object") {
        config.docs.subdirs = { ...DEFAULT_DOCS_CONFIG.subdirs };
    }
    else {
        for (const [key, value] of Object.entries(DEFAULT_DOCS_CONFIG.subdirs)) {
            const current = config.docs.subdirs[key];
            if (typeof current !== "string" || current.trim() === "") {
                config.docs.subdirs[key] = value;
            }
            else {
                config.docs.subdirs[key] = current.trim();
            }
        }
    }
    return config;
}
function getConfigFields(cwd, options) {
    return [
        {
            type: "input",
            name: "projectName",
            accessKey: "project.name",
            message: "Project name:",
            default: path_1.default.basename(cwd),
            validate: (input) => input.trim() !== "" || "Project name is required",
            when: () => !(options === null || options === void 0 ? void 0 : options.project),
        },
        {
            type: "confirm",
            name: "isMonolithic",
            message: "Is this a monolithic app (everything happens in one place with no backend/frontend separation)?",
        },
        {
            type: "input",
            name: "dir",
            accessKey: "project.dir",
            message: "Monolithic app directory (relative to current directory):",
            default: () => "./",
            when: (answers) => answers.isMonolithic === true,
        },
        {
            type: "input",
            name: "frontendDir",
            accessKey: "project.frontendDir",
            message: "Frontend directory (relative to current directory):",
            default: () => "./frontend/",
            when: (answers) => answers.isMonolithic === false,
        },
        {
            type: "input",
            name: "backendDir",
            accessKey: "project.backendDir",
            message: "Backend directory (relative to current directory):",
            default: () => "./backend/",
            when: (answers) => answers.isMonolithic === false,
        },
        {
            type: "input",
            name: "testDirs",
            accessKey: "project.testDirs",
            message: "Test directories (comma-separated, relative to current directory):",
            default: "None",
            filter: (input) => {
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
            default: (options === null || options === void 0 ? void 0 : options.dir) || "bmad-minimal",
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
async function shouldGenerateCSPrompt(configData) {
    var _a, _b, _c;
    const docsDir = (_b = (_a = configData.docs) === null || _a === void 0 ? void 0 : _a.dir) !== null && _b !== void 0 ? _b : DEFAULT_DOCS_CONFIG.dir;
    const codingStdsPath = path_1.default.join(docsDir, "coding-standards.md");
    const project = configData.project || {};
    if (!(await (0, fileOperations_1.exists)(codingStdsPath))) {
        console.log(chalk_1.default.gray("  Writing coding standards template..."));
        const templateTechPrefsPath = path_1.default.join(__dirname, "../templates/coding-standards.md");
        await fs_extra_1.default.copy(templateTechPrefsPath, codingStdsPath);
        const { generateCSPrompt } = await inquirer_1.default.prompt([
            {
                type: "confirm",
                name: "generateCSPrompt",
                message: "Generate coding standards prompt?",
                default: true,
            },
        ]);
        if (generateCSPrompt) {
            const llmPrompt = (0, prompts_1.buildCodingStandardsPrompt)({
                projectName: (_c = project.name) !== null && _c !== void 0 ? _c : "",
                docsDir,
                projectDir: project.dir,
                backendDir: project.backendDir,
                frontendDir: project.frontendDir,
            });
            console.log("\n" + chalk_1.default.cyan("Prompt for your LLM/agent (copy/paste):"));
            console.log(llmPrompt + "\n");
        }
    }
}
