const path = require("path");

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
			name: "projectDir",
			accessKey: "project.projectDir",
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
		{
			type: "confirm",
			name: "generateTPPrompt",
			message: "Generate technical preferences prompt?",
			default: true,
		},
	];
}

module.exports = {
	getConfigFields,
	configFields: getConfigFields,
};
