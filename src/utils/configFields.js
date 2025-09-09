const path = require("path");
const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs-extra");
const { exists } = require("./fileOperations");

function getConfigFields(cwd, options) {
	return [
		{
			type: "input",
			name: "projectName",
			accessKey: "project.name",
			message: "Project name:",
			default: path.basename(cwd),
			validate: (input) => input.trim() !== "" || "Project name is required",
			when: () => !options?.project,
		},
		{
			type: "confirm",
			name: "isSingular",
			message:
				"Is this a singular app (fullstack app or an app with no clear backend/frontend separation)?",
		},
		{
			type: "input",
			name: "dir",
			accessKey: "project.dir",
			message: "App directory (relative to current directory):",
			when: (answers) => answers.isSingular,
		},
		{
			type: "input",
			name: "backendDir",
			accessKey: "project.backendDir",
			message: "Backend directory (relative to current directory):",
			when: (answers) => !answers.isSingular,
		},
		{
			type: "input",
			name: "frontendDir",
			accessKey: "project.frontendDir",
			message: "Frontend directory (relative to current directory):",
			when: (answers) => !answers.isSingular,
		},
		{
			type: "input",
			name: "testDirs",
			accessKey: "project.testDirs",
			message:
				"Test directories (comma-separated, relative to current directory):",
			filter: (input) =>
				input
					.split(",")
					.map((d) => d.trim())
					.filter((d) => d.length > 0),
		},
		{
			type: "input",
			name: "baseDir",
			accessKey: "baseDir",
			message: "Base directory for BMad files:",
			default: options?.dir || "bmad-minimal",
		},
		{
			type: "input",
			name: "docsDir",
			accessKey: "docs.dir",
			message: "Documentation directory:",
			default: "docs",
		},
	];
}

async function shouldGenerateCSPrompt(configData) {
	const codingStdsPath = path.join(configData.docs.dir, "coding-standards.md");

	// Write coding standards from template in src/templates if file doesn't exist
	if (!(await exists(codingStdsPath))) {
		console.log(chalk.gray("  Writing coding standards template..."));
		const templateTechPrefsPath = path.join(
			__dirname,
			"../templates/coding-standards.md"
		);
		await fs.copy(templateTechPrefsPath, codingStdsPath);

		const { generateCSPrompt } = await inquirer.prompt([
			{
				type: "confirm",
				name: "generateCSPrompt",
				message: "Generate coding standards prompt?",
				default: true,
			},
		]);

		if (generateCSPrompt) {
			// Ready-to-use prompt for an LLM/agent to help fill coding-preferences.md (coding standards)
			const contextLines = [`- Project name: ${configData.project.name}`];

			if (configData.project.dir) {
				contextLines.push(`- App directory: ${configData.project.dir}`);
			}
			if (configData.project.backendDir) {
				contextLines.push(
					`- Backend directory: ${configData.project.backendDir}`
				);
			}
			if (configData.project.frontendDir) {
				contextLines.push(
					`- Frontend directory: ${configData.project.frontendDir}`
				);
			}
			contextLines.push(`- Docs directory: ${configData.docs.dir}`);

			const llmPrompt = `Task: Create or update ${codingStdsPath} with the team's coding conventions using the lean template headings (naming, files & directories, imports/exports, error handling, logging, testing, security & privacy, Git/PR, and the short review checklist).\n\nInstructions:\n- Inspect this workspace to infer actual conventions from existing code and configs.\n- Use Architecture documents for technology choices; do not duplicate tech selection here. Focus on conventions and policies only.\n- Keep entries concise and actionable. If unsure, propose sensible defaults and clearly mark items needing confirmation.\n- Modify only ${codingStdsPath}. If the file does not exist, create it. Preserve the heading structure.\n\nContext:\n${contextLines.join(
				"\n"
			)}\n\nOutput: Provide either the markdown content of ${codingStdsPath} or a unified diff that creates/updates only that file.`;

			console.log(
				"\n" + chalk.cyan("Prompt for your LLM/agent (copy/paste):")
			);
			console.log(llmPrompt + "\n");
		}
	}
}

module.exports = {
	getConfigFields,
	shouldGenerateCSPrompt,
};
