"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyCoreDirectories = copyCoreDirectories;
exports.ensureDocsStructure = ensureDocsStructure;
exports.copyCheatSheetToWorkspace = copyCheatSheetToWorkspace;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const fileOperations_1 = require("./fileOperations");
async function copyCoreDirectories(coreDir, baseDir) {
    const engineeringSource = path_1.default.join(coreDir, "engineering");
    const engineeringDest = path_1.default.join(baseDir, "engineering");
    await fs_extra_1.default.copy(engineeringSource, engineeringDest, { overwrite: true });
    const planningSource = path_1.default.join(coreDir, "planning");
    const planningDest = path_1.default.join(baseDir, "planning");
    await fs_extra_1.default.copy(planningSource, planningDest, { overwrite: true });
}
async function ensureDocsStructure(cwd, configData) {
    const docsDir = path_1.default.join(cwd, configData.docs.dir);
    await fs_extra_1.default.ensureDir(docsDir);
    for (const subDir of Object.values(configData.docs.subdirs)) {
        await fs_extra_1.default.ensureDir(path_1.default.join(docsDir, subDir));
    }
}
async function copyCheatSheetToWorkspace(cwd, configData) {
    const packageCheatSheetPath = (0, fileOperations_1.getPath)("docs/cheat-sheet.md");
    const workspaceCheatSheetPath = path_1.default.join(cwd, configData.docs.dir, "cheat-sheet.md");
    if (!(await fs_extra_1.default.pathExists(packageCheatSheetPath))) {
        return;
    }
    await fs_extra_1.default.ensureDir(path_1.default.dirname(workspaceCheatSheetPath));
    await fs_extra_1.default.copy(packageCheatSheetPath, workspaceCheatSheetPath, {
        overwrite: true,
    });
}
