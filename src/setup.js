const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const { createTemplateFiles } = require('./templates');
const { detectProjectInfo } = require('./detection');

async function setupWorkspace(targetPath, options) {
  // Validate target path
  if (!targetPath || typeof targetPath !== 'string') {
    throw new Error('Invalid target path provided');
  }

  // Ensure target directory exists
  try {
    await fs.ensureDir(targetPath);
  } catch (error) {
    throw new Error(`Cannot access target directory: ${error.message}`);
  }

  const workspacePath = path.join(targetPath, 'bmad-minimal');
  
  // Check if bmad-minimal folder already exists
  if (await fs.pathExists(workspacePath)) {
    if (!options.yes) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `The folder '${workspacePath}' already exists. Do you want to overwrite it?`,
          default: false
        }
      ]);
      
      if (!overwrite) {
        throw new Error('Setup cancelled by user');
      }
    }
    
    try {
      await fs.remove(workspacePath);
    } catch (error) {
      throw new Error(`Failed to remove existing workspace: ${error.message}`);
    }
  }

  let config;
  let projectInfo;
  
  try {
    // Get configuration from user
    config = options.yes ? getDefaultConfig() : await promptUserConfig(targetPath);
    
    // Create workspace structure
    await createWorkspaceStructure(workspacePath, config);
    
    // Initialize git repository
    await initializeGitRepo(workspacePath);
    
    // Generate template files
    projectInfo = await detectProjectInfo(targetPath);
    await createTemplateFiles(workspacePath, config, projectInfo);
    
    // Create version file
    await createVersionFile(workspacePath);
    
  } catch (error) {
    // Rollback on error
    console.error(chalk.red('\n❌ Setup failed, cleaning up...'));
    
    if (await fs.pathExists(workspacePath)) {
      try {
        await fs.remove(workspacePath);
      } catch (cleanupError) {
        console.warn(chalk.yellow(`⚠️ Could not clean up workspace: ${cleanupError.message}`));
      }
    }
    
    throw error;
  }
  
  return { workspacePath, config };
}

async function promptUserConfig(targetPath) {
  console.log(chalk.yellow('📋 Let\'s configure your BMAD workspace:\n'));
  
  const questions = [
    {
      type: 'confirm',
      name: 'includePlanning',
      message: 'Do you want to include planning files? (recommended for web-based planning)',
      default: true
    },
    {
      type: 'input',
      name: 'docsLocation',
      message: 'Where should documentation files be stored?',
      default: 'docs',
      validate: validatePath
    },
    {
      type: 'input',
      name: 'epicLocation',
      message: 'Where should epic files be stored?',
      default: 'docs/epics',
      validate: validatePath
    },
    {
      type: 'input',
      name: 'storyLocation',
      message: 'Where should story files be stored?',
      default: 'docs/stories',
      validate: validatePath
    },
    {
      type: 'input',
      name: 'qaLocation',
      message: 'Where should QA files be stored?',
      default: 'docs/qa',
      validate: validatePath
    }
  ];

  const answers = await inquirer.prompt(questions);
  
  return {
    includePlanning: answers.includePlanning,
    folders: {
      docs: answers.docsLocation,
      epics: answers.epicLocation,
      stories: answers.storyLocation,
      qa: answers.qaLocation
    }
  };
}

function getDefaultConfig() {
  return {
    includePlanning: true,
    folders: {
      docs: 'docs',
      epics: 'docs/epics',
      stories: 'docs/stories',
      qa: 'docs/qa'
    }
  };
}

async function createWorkspaceStructure(workspacePath, config) {
  console.log(chalk.blue('📁 Creating workspace structure...'));
  
  // Create main directories
  await fs.ensureDir(path.join(workspacePath, '.agents'));
  await fs.ensureDir(path.join(workspacePath, '.bmad-core'));
  
  // Create planning folder if requested
  if (config.includePlanning) {
    await fs.ensureDir(path.join(workspacePath, 'planning'));
  }
  
  // Create configured folders within .bmad-core
  const bmadCorePath = path.join(workspacePath, '.bmad-core');
  await fs.ensureDir(path.join(bmadCorePath, config.folders.docs));
  await fs.ensureDir(path.join(bmadCorePath, config.folders.epics));
  await fs.ensureDir(path.join(bmadCorePath, config.folders.stories));
  await fs.ensureDir(path.join(bmadCorePath, config.folders.qa));
  
  // Create documentation structure
  await fs.ensureDir(path.join(bmadCorePath, config.folders.docs, 'prd'));
  await fs.ensureDir(path.join(bmadCorePath, config.folders.docs, 'architecture'));
}

function validatePath(input) {
  const trimmed = input.trim();
  
  if (trimmed.length === 0) {
    return 'Path cannot be empty';
  }
  
  // Check for invalid characters
  const invalidChars = /[<>:"|?*\\]|\.\.|\/\.|^\.|\.$|\s$/;
  if (invalidChars.test(trimmed)) {
    return 'Path contains invalid characters or patterns';
  }
  
  // Check for absolute paths
  if (path.isAbsolute(trimmed)) {
    return 'Please use relative paths only';
  }
  
  return true;
}

async function createVersionFile(workspacePath) {
  const version = require('../package.json').version;
  const versionPath = path.join(workspacePath, '.bmad-version');
  await fs.writeFile(versionPath, version);
}

async function initializeGitRepo(workspacePath) {
  console.log(chalk.blue('🔧 Initializing git repository...'));
  
  try {
    execSync('git init', { 
      cwd: workspacePath, 
      stdio: 'pipe' 
    });
    
    // Create .gitignore
    const gitignoreContent = `# BMAD Core files
.bmad-core/
.agents/

# Planning files (optional - remove if you want to track planning)
planning/

# Node modules (if applicable)
node_modules/

# Environment files
.env
.env.local
.env.*.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
`;
    
    await fs.writeFile(path.join(workspacePath, '.gitignore'), gitignoreContent);
    
  } catch (error) {
    console.warn(chalk.yellow('⚠️ Could not initialize git repository. You can do this manually later.'));
  }
}

module.exports = { setupWorkspace };
