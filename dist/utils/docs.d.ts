import type { SwaadConfig } from "./config";
export declare function copyCoreDirectories(coreDir: string, baseDir: string): Promise<void>;
export declare function ensureDocsStructure(cwd: string, configData: SwaadConfig): Promise<void>;
export declare function copyCheatSheetToWorkspace(cwd: string, configData: SwaadConfig): Promise<void>;
