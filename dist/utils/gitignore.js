"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureIgnored = ensureIgnored;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
async function ensureIgnored({ cwd, entry, }) {
    const trimmed = String(entry !== null && entry !== void 0 ? entry : "").trim();
    if (!trimmed)
        return false;
    const gitignorePath = path_1.default.join(cwd, ".gitignore");
    let content = "";
    try {
        content = await fs_extra_1.default.readFile(gitignorePath, "utf-8");
    }
    catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
    const lines = content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    const already = lines.some((line) => line === trimmed || line === `${trimmed}/`);
    if (already)
        return false;
    const needsNewline = content.length > 0 && !content.endsWith("\n");
    await fs_extra_1.default.appendFile(gitignorePath, `${needsNewline ? "\n" : ""}${trimmed}\n`);
    return true;
}
