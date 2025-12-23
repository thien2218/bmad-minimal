"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = install;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const fileOperations_1 = require("../utils/fileOperations");
const gitignore_1 = require("../utils/gitignore");
const config_1 = require("../utils/config");
const docs_1 = require("../utils/docs");
const compress_1 = require("../utils/compress");
async function install(options = {}) {
    var _a, _b, _c;
    console.log(chalk_1.default.blue("🚀 BMad Minimal Installation\n"));
    const cwd = process.cwd();
    const coreDir = (0, fileOperations_1.getPath)("core");
    const existingConfigs = await findExistingConfigs(cwd);
    if (existingConfigs.length > 0) {
        console.log(chalk_1.default.yellow("⚠️ BMad Minimal configuration already exists:"));
        existingConfigs.forEach((config) => console.log(`   - ${config}`));
        const { proceed } = await inquirer_1.default.prompt([
            {
                type: "confirm",
                name: "proceed",
                message: "Do you want to overwrite the existing configuration?",
                default: false,
            },
        ]);
        if (!proceed) {
            console.log(chalk_1.default.gray("Installation cancelled."));
            return;
        }
    }
    const configAnswers = await gatherConfiguration(options, cwd);
    console.log(chalk_1.default.blue("\n📦 Installing BMad Minimal files...\n"));
    try {
        const baseDir = path_1.default.join(cwd, (_a = configAnswers.baseDir) !== null && _a !== void 0 ? _a : "bmad-minimal");
        await fs_extra_1.default.ensureDir(baseDir);
        console.log(chalk_1.default.gray("  Copying engineering and planning files..."));
        await (0, docs_1.copyCoreDirectories)(coreDir, baseDir);
        console.log(chalk_1.default.gray("  Compressing agent configurations..."));
        await (0, compress_1.compressAgentConfigs)(baseDir);
        const configPath = path_1.default.join(baseDir, "config.json");
        const defaultConfig = await (0, config_1.loadDefaultConfig)(coreDir);
        const configData = (0, config_1.mergeConfig)(defaultConfig, configAnswers);
        console.log(chalk_1.default.gray("  Writing configuration..."));
        await (0, fileOperations_1.writeJson)(configPath, configData);
        await (0, docs_1.ensureDocsStructure)(cwd, configData);
        try {
            await (0, docs_1.copyCheatSheetToWorkspace)(cwd, configData);
            console.log(chalk_1.default.gray(`  Copied cheat sheet to ${configData.docs.dir}/cheat-sheet.md`));
        }
        catch (error) {
            console.log(chalk_1.default.yellow(`  Warning: failed to copy cheat sheet: ${error.message}`));
        }
        try {
            const entry = String((_b = configAnswers.baseDir) !== null && _b !== void 0 ? _b : "").trim();
            const modified = await (0, gitignore_1.ensureIgnored)({ cwd, entry });
            if (entry) {
                console.log(chalk_1.default.gray(modified
                    ? `  Added "${entry}" to .gitignore`
                    : `  .gitignore already includes "${entry}"`));
            }
        }
        catch (error) {
            console.log(chalk_1.default.yellow(`  Warning: failed to update .gitignore: ${error.message}`));
        }
        await (0, config_1.shouldGenerateCSPrompt)(configData);
        console.log(chalk_1.default.green("\n✅ BMad Minimal installation complete!\n"));
        console.log(chalk_1.default.cyan("📁 Structure created:"));
        console.log(`   ${(_c = configAnswers.baseDir) !== null && _c !== void 0 ? _c : "bmad-minimal"}/`);
        console.log("   ├── config.json");
        console.log("   ├── engineering/");
        console.log("   └── planning/");
        console.log(`   ${configData.docs.dir}/`);
        console.log(`   ├── ${configData.docs.subdirs.epics}/`);
        console.log(`   ├── ${configData.docs.subdirs.stories}/`);
        console.log(`   ├── ${configData.docs.subdirs.qa}/`);
        console.log(`   ├── ${configData.docs.subdirs.prds}/`);
        console.log("   └── coding-standards.md");
    }
    catch (error) {
        console.error(chalk_1.default.red("❌ Installation failed:"), error.message);
        throw error;
    }
}
async function findExistingConfigs(cwd) {
    const configs = [];
    const possibleDirs = ["bmad-minimal"];
    for (const dir of possibleDirs) {
        const configPath = path_1.default.join(cwd, dir, "config.json");
        if (await (0, fileOperations_1.exists)(configPath)) {
            configs.push(`${dir}/config.json`);
        }
    }
    return configs;
}
async function gatherConfiguration(options, cwd) {
    const answers = await inquirer_1.default.prompt((0, config_1.getConfigFields)(cwd, options));
    if (!answers.projectName) {
        const response = await inquirer_1.default.prompt([
            {
                type: "input",
                name: "projectName",
                message: "Project name:",
                default: path_1.default.basename(cwd),
                validate: (input) => input.trim() !== "" || "Project name is required",
            },
        ]);
        answers.projectName = response.projectName;
    }
    if (!answers.dir && !answers.backendDir && !answers.frontendDir) {
        console.error(chalk_1.default.red("❌ Installation aborted: provide at least one of App, Backend, or Frontend directory."));
        throw new Error("No app/backend/frontend directory provided");
    }
    const { isNewProject } = await inquirer_1.default.prompt([
        {
            type: "confirm",
            name: "isNewProject",
            message: "Is this a new project?",
            default: true,
        },
    ]);
    answers.projectType = isNewProject ? "greenfield" : "brownfield";
    return answers;
}
exports.default = install;
