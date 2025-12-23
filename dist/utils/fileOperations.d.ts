export declare function copyDirectory(source: string, destination: string, excludePatterns?: string[]): Promise<void>;
export declare function readJson<T = unknown>(filePath: string): Promise<T | null>;
export declare function writeJson<T>(filePath: string, data: T): Promise<void>;
export declare function getPath(name: string): string;
export declare function exists(targetPath: string): Promise<boolean>;
