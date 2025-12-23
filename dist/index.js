"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.install = void 0;
const install_1 = __importDefault(require("./commands/install"));
exports.install = install_1.default;
const update_1 = __importDefault(require("./commands/update"));
exports.update = update_1.default;
exports.default = { install: install_1.default, update: update_1.default };
