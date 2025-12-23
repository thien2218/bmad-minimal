"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressAgentConfigs = compressAgentConfigs;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
async function compressAgentConfigInFile(filePath) {
    try {
        const content = await fs_extra_1.default.readFile(filePath, "utf-8");
        const markerIndex = content.indexOf("<!-- INSTRUCTIONS_AND_RULES:JSON -->");
        if (markerIndex === -1) {
            return { changed: false, error: null };
        }
        const jsonBlockStart = content.indexOf("```json", markerIndex);
        if (jsonBlockStart === -1) {
            return { changed: false, error: null };
        }
        const jsonContentStart = jsonBlockStart + "```json".length;
        const jsonBlockEnd = content.indexOf("```", jsonContentStart);
        if (jsonBlockEnd === -1) {
            return { changed: false, error: null };
        }
        const jsonContent = content
            .substring(jsonContentStart, jsonBlockEnd)
            .trim();
        if (!jsonContent) {
            return { changed: false, error: null };
        }
        let parsedJson;
        try {
            parsedJson = JSON.parse(jsonContent);
        }
        catch (parseError) {
            console.warn(chalk_1.default.yellow(`Warning: Failed to parse JSON in ${filePath}: ${parseError.message}`));
            return { changed: false, error: parseError };
        }
        const minifiedJson = JSON.stringify(parsedJson);
        const beforeBlock = content.substring(0, jsonContentStart);
        const afterBlock = content.substring(jsonBlockEnd);
        const newContent = `${beforeBlock}\n${minifiedJson}\n${afterBlock}`;
        await fs_extra_1.default.writeFile(filePath, newContent, "utf-8");
        return { changed: true, error: null };
    }
    catch (error) {
        return { changed: false, error: error };
    }
}
async function compressAgentConfigs(rootDir) {
    const stats = { processed: 0, modified: 0, errors: 0 };
    const agentDirs = [
        path_1.default.join(rootDir, "engineering", "agents"),
        path_1.default.join(rootDir, "planning", "agents"),
    ];
    for (const agentDir of agentDirs) {
        try {
            if (!(await fs_extra_1.default.pathExists(agentDir))) {
                continue;
            }
            const files = await fs_extra_1.default.readdir(agentDir);
            const markdownFiles = files.filter((file) => file.endsWith(".md"));
            for (const file of markdownFiles) {
                const filePath = path_1.default.join(agentDir, file);
                stats.processed++;
                const result = await compressAgentConfigInFile(filePath);
                if (result.error) {
                    stats.errors++;
                }
                if (result.changed) {
                    stats.modified++;
                }
            }
        }
        catch (error) {
            console.warn(chalk_1.default.yellow(`Warning: Failed to process directory ${agentDir}: ${error.message}`));
            stats.errors++;
        }
    }
    return stats;
}
