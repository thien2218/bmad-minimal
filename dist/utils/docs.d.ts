import type { BmadConfig } from "./config";
export declare function copyCoreDirectories(coreDir: string, baseDir: string): Promise<void>;
export declare function ensureDocsStructure(cwd: string, configData: BmadConfig): Promise<void>;
export declare function copyCheatSheetToWorkspace(cwd: string, configData: BmadConfig): Promise<void>;
