"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyDirectory = copyDirectory;
exports.readJson = readJson;
exports.writeJson = writeJson;
exports.getPath = getPath;
exports.exists = exists;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
async function copyDirectory(source, destination, excludePatterns = []) {
    await fs_extra_1.default.ensureDir(destination);
    const items = await fs_extra_1.default.readdir(source, { withFileTypes: true });
    for (const item of items) {
        const sourcePath = path_1.default.join(source, item.name);
        const destPath = path_1.default.join(destination, item.name);
        const shouldExclude = excludePatterns.some((pattern) => new RegExp(pattern).test(item.name));
        if (shouldExclude)
            continue;
        if (item.isDirectory()) {
            await copyDirectory(sourcePath, destPath, excludePatterns);
        }
        else {
            await fs_extra_1.default.copy(sourcePath, destPath, { overwrite: true });
        }
    }
}
async function readJson(filePath) {
    try {
        const content = await fs_extra_1.default.readFile(filePath, "utf-8");
        return JSON.parse(content);
    }
    catch (error) {
        if (error.code === "ENOENT") {
            return null;
        }
        throw error;
    }
}
async function writeJson(filePath, data) {
    await fs_extra_1.default.ensureDir(path_1.default.dirname(filePath));
    await fs_extra_1.default.writeFile(filePath, JSON.stringify(data, null, "\t"));
}
function getPath(name) {
    return path_1.default.join(__dirname, "..", "..", name);
}
async function exists(targetPath) {
    try {
        await fs_extra_1.default.access(targetPath);
        return true;
    }
    catch {
        return false;
    }
}
