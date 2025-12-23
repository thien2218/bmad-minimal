"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCodingStandardsPrompt = buildCodingStandardsPrompt;
function buildCodingStandardsPrompt({ projectName, docsDir, projectDir, backendDir, frontendDir, }) {
    const displayPath = `${docsDir}/coding-standards.md`;
    const contextLines = [`- Project name: ${projectName}`];
    if (projectDir)
        contextLines.push(`- App directory: ${projectDir}`);
    if (backendDir)
        contextLines.push(`- Backend directory: ${backendDir}`);
    if (frontendDir)
        contextLines.push(`- Frontend directory: ${frontendDir}`);
    contextLines.push(`- Docs directory: ${docsDir}`);
    return (`Task: Create or update ${displayPath} with the team's coding conventions using the lean template headings (naming, files & directories, imports/exports, error handling, logging, testing, security & privacy, Git/PR, and the short review checklist).` +
        `\n\nInstructions:` +
        `\n- Inspect this workspace to infer actual conventions from existing code and configs.` +
        `\n- Use Architecture documents for technology choices; do not duplicate tech selection here. Focus on conventions and policies only.` +
        `\n- Keep entries concise and actionable. If unsure, propose sensible defaults and clearly mark items needing confirmation.` +
        `\n- Modify only ${displayPath}. If the file does not exist, create it. Preserve the heading structure.` +
        `\n\nContext:` +
        `\n${contextLines.join("\n")}` +
        `\n\nOutput: Provide either the markdown content of ${displayPath} or a unified diff that creates/updates only that file.`);
}
