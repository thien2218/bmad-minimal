interface CodingStandardsPromptOptions {
    projectName: string;
    docsDir: string;
    projectDir?: string;
    backendDir?: string;
    frontendDir?: string;
}
export declare function buildCodingStandardsPrompt({ projectName, docsDir, projectDir, backendDir, frontendDir, }: CodingStandardsPromptOptions): string;
export {};
