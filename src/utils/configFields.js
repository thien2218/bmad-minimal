const path = require("path");
const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs-extra");
const { exists } = require("./fileOperations");
const { buildCodingStandardsPrompt } = require("../lib/promptBuilders");

/**
 * Build interactive prompts used to gather installation configuration.
 * This returns plain question objects consumable by inquirer.
 *
 * @param {string} cwd - Current working directory used for defaults.
 * @param {Object} [options]
 * @returns {Array<Object>} Inquirer-style question definitions.
 */
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

/**
 * Optionally create coding-standards.md from a template and display
 * a ready-to-use LLM prompt to complete it.
 *
 * @param {object} configData - The merged configuration data that will be written to config.json
 * @returns {Promise<void>}
 */
async function shouldGenerateCSPrompt(configData) {
	const codingStdsPath = path.join(configData.docs.dir, "coding-standards.md");

	// Write coding standards from template if file doesn't exist
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
			const llmPrompt = buildCodingStandardsPrompt({
				projectName: configData.project.name,
				docsDir: configData.docs.dir,
				projectDir: configData.project.dir,
				backendDir: configData.project.backendDir,
				frontendDir: configData.project.frontendDir,
			});

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
