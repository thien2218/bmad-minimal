interface CompressionStats {
    processed: number;
    modified: number;
    errors: number;
}
export declare function compressAgentConfigs(rootDir: string): Promise<CompressionStats>;
export {};
