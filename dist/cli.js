#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCli = runCli;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const install_1 = require("./commands/install");
const update_1 = require("./commands/update");
const packageJson = require("../package.json");
const program = new commander_1.Command();
program
    .name("swaad")
    .description("SWAAD (Software Agile Development with AI) - A streamlined development workflow for AI-assisted projects, designed for developers")
    .version((_a = packageJson.version) !== null && _a !== void 0 ? _a : "0.0.0");
program
    .command("install")
    .description("Install SWAAD configuration and documentation structure")
    .option("-p, --project <name>", "Specify project name")
    .option("-d, --dir <path>", "Base directory for SWAAD files (default: swaad)")
    .action(async (options) => {
    try {
        await (0, install_1.install)(options);
    }
    catch (error) {
        console.error(chalk_1.default.red("❌ Installation failed:"), error.message);
        process.exit(1);
    }
});
program
    .command("update")
    .description("Update documentation to the latest version while preserving config.json")
    .option("-f, --force", "Force update without confirmation")
    .action(async (options) => {
    try {
        await (0, update_1.update)(options);
    }
    catch (error) {
        console.error(chalk_1.default.red("❌ Update failed:"), error.message);
        process.exit(1);
    }
});
async function runCli(argv = process.argv) {
    await program.parseAsync(argv);
}
if (require.main === module) {
    runCli();
}
