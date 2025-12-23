import type { Answers, Question } from "inquirer";
export interface DocsSubdirs {
    [key: string]: string;
}
export interface DocsConfig {
    dir: string;
    subdirs: DocsSubdirs;
}
export interface ProjectConfig {
    name?: string;
    type?: string;
    dir?: string;
    backendDir?: string;
    frontendDir?: string;
    testDirs?: string[];
}
export interface BmadConfig {
    baseDir?: string;
    project?: ProjectConfig;
    docs: DocsConfig;
    [key: string]: unknown;
}
export interface ConfigAnswers extends Answers {
    projectName?: string;
    isMonolithic?: boolean;
    dir?: string;
    frontendDir?: string;
    backendDir?: string;
    testDirs?: string[];
    baseDir?: string;
    docsDir?: string;
    projectType?: string;
}
export type ConfigQuestion = Question<ConfigAnswers> & {
    accessKey?: string;
};
interface ConfigLocation {
    dir: string;
    path: string;
}
export declare function findConfig(cwd: string): Promise<ConfigLocation | null>;
export declare function loadDefaultConfig(coreDir: string): Promise<BmadConfig>;
export declare function mergeConfig(defaultConfig: BmadConfig, answers: ConfigAnswers): BmadConfig;
export declare function ensureDocsDefaults<T extends BmadConfig | null | undefined>(config: T): T;
export declare function getConfigFields(cwd: string, options?: {
    project?: string;
    dir?: string;
}): ConfigQuestion[];
export declare function shouldGenerateCSPrompt(configData: BmadConfig): Promise<void>;
export {};
