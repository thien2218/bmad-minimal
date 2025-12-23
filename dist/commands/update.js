"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = update;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const fileOperations_1 = require("../utils/fileOperations");
const docs_1 = require("../utils/docs");
const config_1 = require("../utils/config");
const compress_1 = require("../utils/compress");
async function update(options = {}) {
    console.log(chalk_1.default.blue("🔄 SWAAD Update\n"));
    const cwd = process.cwd();
    const coreDir = (0, fileOperations_1.getPath)("core");
    const configLocation = await (0, config_1.findConfig)(cwd);
    if (!configLocation) {
        console.error(chalk_1.default.red("❌ No SWAAD configuration found."));
        console.log(chalk_1.default.gray('Run "swaad install" to set up SWAAD first.'));
        return;
    }
    console.log(chalk_1.default.gray(`Found configuration at: ${configLocation.dir}/config.json`));
    const configPath = path_1.default.join(cwd, configLocation.dir, "config.json");
    const config = await (0, fileOperations_1.readJson)(configPath);
    if (!config) {
        console.error(chalk_1.default.red("❌ Failed to read configuration file."));
        return;
    }
    const configUpdated = await promptMissingConfig({ cwd, config, configPath });
    if (!options.force) {
        console.log(chalk_1.default.yellow("\n⚠️  This will update all SWAAD files to the latest version."));
        const preserveMessage = configUpdated
            ? "   Your config.json was updated with missing fields and other fields will be preserved; all other files will be overwritten."
            : "   Your config.json will be preserved, but all other files will be overwritten.";
        console.log(chalk_1.default.yellow(preserveMessage));
        const { proceed } = await inquirer_1.default.prompt([
            {
                type: "confirm",
                name: "proceed",
                message: "Do you want to proceed with the update?",
                default: true,
            },
        ]);
        if (!proceed) {
            console.log(chalk_1.default.gray("Update cancelled."));
            return;
        }
    }
    console.log(chalk_1.default.blue("\n📦 Updating SWAAD files...\n"));
    try {
        const baseDir = path_1.default.join(cwd, configLocation.dir);
        (0, config_1.ensureDocsDefaults)(config);
        const configBackup = JSON.parse(JSON.stringify(config));
        const engineeringSource = path_1.default.join(coreDir, "engineering");
        const engineeringDest = path_1.default.join(baseDir, "engineering");
        if (await (0, fileOperations_1.exists)(engineeringDest)) {
            console.log(chalk_1.default.gray("  Updating engineering files..."));
            await fs_extra_1.default.remove(engineeringDest);
            await (0, fileOperations_1.copyDirectory)(engineeringSource, engineeringDest);
        }
        else {
            console.log(chalk_1.default.gray("  Installing engineering files..."));
            await (0, fileOperations_1.copyDirectory)(engineeringSource, engineeringDest);
        }
        const planningDest = path_1.default.join(baseDir, "planning");
        if (await (0, fileOperations_1.exists)(planningDest)) {
            const planningSource = path_1.default.join(coreDir, "planning");
            console.log(chalk_1.default.gray("  Updating planning files..."));
            await fs_extra_1.default.remove(planningDest);
            await (0, fileOperations_1.copyDirectory)(planningSource, planningDest);
        }
        console.log(chalk_1.default.gray("  Compressing agent configurations..."));
        await (0, compress_1.compressAgentConfigs)(baseDir);
        console.log(chalk_1.default.gray("  Preserving configuration..."));
        await (0, fileOperations_1.writeJson)(configPath, configBackup);
        await (0, config_1.shouldGenerateCSPrompt)(configBackup);
        try {
            await (0, docs_1.copyCheatSheetToWorkspace)(cwd, configBackup);
            console.log(chalk_1.default.gray(`  Copied cheat sheet to ${configBackup.docs.dir}/cheat-sheet.md`));
        }
        catch (error) {
            console.log(chalk_1.default.yellow(`  Warning: failed to copy cheat sheet: ${error.message}`));
        }
        await (0, docs_1.ensureDocsStructure)(cwd, configBackup);
        console.log(chalk_1.default.green("\n✅ SWAAD update complete!"));
        console.log(chalk_1.default.cyan("\n📋 Updated components:"));
        console.log("   ✓ Engineering files");
        console.log("   ✓ Planning files");
        console.log("   ✓ Coding standards");
        console.log("   ✓ Configuration");
        const packageJsonPath = path_1.default.join(coreDir, "../package.json");
        if (await (0, fileOperations_1.exists)(packageJsonPath)) {
            const packageJson = await (0, fileOperations_1.readJson)(packageJsonPath);
            if (packageJson === null || packageJson === void 0 ? void 0 : packageJson.version) {
                console.log(chalk_1.default.gray(`\nVersion: ${packageJson.version}`));
            }
        }
    }
    catch (error) {
        console.error(chalk_1.default.red("❌ Update failed:"), error.message);
        throw error;
    }
}
function getValueByPath(object, accessKey) {
    const parts = accessKey.split(".");
    let current = object;
    for (const part of parts) {
        if (current == null || typeof current !== "object")
            return undefined;
        current = current[part];
    }
    return current;
}
function setValueByPath(object, accessKey, value) {
    const parts = accessKey.split(".");
    let current = object;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (current[part] == null || typeof current[part] !== "object") {
            current[part] = {};
        }
        current = current[part];
    }
    current[parts[parts.length - 1]] = value;
}
async function promptMissingConfig({ cwd, config, configPath, }) {
    const allFields = (0, config_1.getConfigFields)(cwd);
    const configurable = allFields.filter((field) => !!field.accessKey);
    const missing = configurable.filter((field) => {
        const val = field.accessKey
            ? getValueByPath(config, field.accessKey)
            : undefined;
        return val === undefined;
    });
    if (missing.length === 0)
        return false;
    const answers = await inquirer_1.default.prompt(missing);
    for (const field of missing) {
        if (!field.accessKey)
            continue;
        const rawValue = answers[field.name];
        const value = typeof field.filter === "function"
            ? field.filter(rawValue, answers)
            : rawValue;
        setValueByPath(config, field.accessKey, value);
    }
    await (0, fileOperations_1.writeJson)(configPath, config);
    return true;
}
exports.default = update;
