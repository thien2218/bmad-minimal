interface EnsureIgnoredParams {
    cwd: string;
    entry?: string;
}
export declare function ensureIgnored({ cwd, entry, }: EnsureIgnoredParams): Promise<boolean>;
export {};
