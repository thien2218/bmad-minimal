"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const fileOperations_1 = require("../utils/fileOperations");
const coreDir = (0, fileOperations_1.getPath)("core");
const AGENTS_DIRS = [
    path_1.default.join(coreDir, "engineering", "agents"),
    path_1.default.join(coreDir, "planning", "agents"),
];
function parseAgentConfigFromMarkdown(content, filePath) {
    const markerIndex = content.indexOf("```json");
    if (markerIndex === -1) {
        return null;
    }
    const jsonContentStart = markerIndex + "```json".length;
    const jsonBlockEnd = content.indexOf("```", jsonContentStart);
    if (jsonBlockEnd === -1) {
        return null;
    }
    const jsonContent = content.substring(jsonContentStart, jsonBlockEnd).trim();
    if (!jsonContent) {
        return null;
    }
    try {
        return JSON.parse(jsonContent);
    }
    catch (parseError) {
        console.warn(chalk_1.default.yellow(`Warning: Failed to parse JSON in ${filePath}: ${parseError.message}`));
        return null;
    }
}
async function bundleAgentWithDependencies() {
    const bundledRoot = (0, fileOperations_1.getPath)("bundled");
    for (const agentDir of AGENTS_DIRS) {
        if (!(await fs_extra_1.default.pathExists(agentDir))) {
            continue;
        }
        const categoryRoot = path_1.default.dirname(agentDir);
        const category = path_1.default.basename(categoryRoot);
        const outputCategoryDir = path_1.default.join(bundledRoot, category);
        await fs_extra_1.default.ensureDir(outputCategoryDir);
        const files = await fs_extra_1.default.readdir(agentDir);
        const markdownFiles = files.filter((file) => file.endsWith(".md"));
        for (const file of markdownFiles) {
            const agentPath = path_1.default.join(agentDir, file);
            const agentName = path_1.default.basename(file, path_1.default.extname(file));
            const outputPath = path_1.default.join(outputCategoryDir, `${agentName}.txt`);
            const agentContent = await fs_extra_1.default.readFile(agentPath, "utf-8");
            const bundleParts = [];
            bundleParts.push(`# Agent file: ${file}`);
            bundleParts.push(agentContent.trimEnd());
            const config = parseAgentConfigFromMarkdown(agentContent, agentPath);
            if (config === null || config === void 0 ? void 0 : config.commands) {
                const dependencySet = new Set();
                for (const command of config.commands) {
                    if (!(command === null || command === void 0 ? void 0 : command.steps))
                        continue;
                    for (const step of command.steps) {
                        if (typeof step !== "string")
                            continue;
                        const trimmed = step.trim();
                        if (trimmed) {
                            dependencySet.add(trimmed);
                        }
                    }
                }
                for (const relPath of dependencySet) {
                    const fullPath = path_1.default.join(categoryRoot, relPath);
                    try {
                        const depContent = await fs_extra_1.default.readFile(fullPath, "utf-8");
                        bundleParts.push(`\n\n# Dependency: ${relPath}\n\n${depContent.trimEnd()}`);
                    }
                    catch (error) {
                        console.warn(chalk_1.default.yellow(`Warning: Failed to include dependency ${relPath} for agent ${agentPath}: ${error.message}`));
                    }
                }
            }
            await fs_extra_1.default.writeFile(outputPath, bundleParts.join("\n\n"), "utf-8");
        }
    }
}
async function updateCheatSheetWithAgent() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const cheatSheetPath = (0, fileOperations_1.getPath)("docs/cheat-sheet.md");
    const sections = [];
    for (const agentDir of AGENTS_DIRS) {
        if (!(await fs_extra_1.default.pathExists(agentDir))) {
            continue;
        }
        const files = await fs_extra_1.default.readdir(agentDir);
        const markdownFiles = files.filter((file) => file.endsWith(".md"));
        for (const file of markdownFiles) {
            const agentPath = path_1.default.join(agentDir, file);
            const agentContent = await fs_extra_1.default.readFile(agentPath, "utf-8");
            const config = parseAgentConfigFromMarkdown(agentContent, agentPath);
            if (!config)
                continue;
            const persona = (_b = (_a = config.persona) === null || _a === void 0 ? void 0 : _a.agent) !== null && _b !== void 0 ? _b : {};
            const commands = Array.isArray(config.commands) ? config.commands : [];
            const agentId = persona.id && persona.id.trim()
                ? persona.id.trim()
                : path_1.default.basename(agentPath, path_1.default.extname(agentPath));
            const title = (_d = (_c = persona.title) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : "";
            const description = (_f = (_e = persona.description) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : "";
            const sectionLines = [];
            sectionLines.push(title ? `## ${agentId} – ${title}` : `## ${agentId}`);
            if (description) {
                sectionLines.push("");
                sectionLines.push(description);
            }
            if (commands.length > 0) {
                sectionLines.push("");
                sectionLines.push("### Commands");
                sectionLines.push("");
                for (const cmd of commands) {
                    if (!(cmd === null || cmd === void 0 ? void 0 : cmd.name))
                        continue;
                    const name = cmd.name.trim();
                    if (!name)
                        continue;
                    const params = Array.isArray(cmd.parameters) ? cmd.parameters : [];
                    const optionalParams = Array.isArray(cmd.optionalParameters)
                        ? cmd.optionalParameters
                        : [];
                    const desc = (_h = (_g = cmd.description) === null || _g === void 0 ? void 0 : _g.trim()) !== null && _h !== void 0 ? _h : "";
                    sectionLines.push(desc ? `- \`${name}\`: ${desc}` : `- \`${name}\``);
                    if (params.length > 0) {
                        sectionLines.push(`  - required: ${params.join(", ")}`);
                    }
                    if (optionalParams.length > 0) {
                        sectionLines.push(`  - optional: ${optionalParams.join(", ")}`);
                    }
                    sectionLines.push("");
                }
                if (sectionLines[sectionLines.length - 1] === "") {
                    sectionLines.pop();
                }
            }
            const section = sectionLines.join("\n");
            if (section.trim()) {
                sections.push(section);
            }
        }
    }
    if (sections.length === 0) {
        return;
    }
    const content = `${sections.join("\n\n---\n\n")}\n`;
    await fs_extra_1.default.ensureDir(path_1.default.dirname(cheatSheetPath));
    await fs_extra_1.default.writeFile(cheatSheetPath, content, "utf-8");
}
async function main() {
    try {
        console.log(chalk_1.default.blue("Running build pipeline...\n"));
        await bundleAgentWithDependencies();
        console.log(chalk_1.default.gray("  Bundled agent files into ./bundled"));
        await updateCheatSheetWithAgent();
        console.log(chalk_1.default.gray("  Updated docs/cheat-sheet.md"));
        console.log(chalk_1.default.green("\nBuild pipeline completed successfully."));
    }
    catch (error) {
        console.error(chalk_1.default.red("Build pipeline failed:"), error.message);
        process.exitCode = 1;
    }
}
if (require.main === module) {
    main();
}
