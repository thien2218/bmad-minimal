const fs = require('fs-extra');
const path = require('path');

async function detectProjectInfo(projectPath) {
  const info = {
    type: 'unknown',
    languages: [],
    frameworks: [],
    runtime: null,
    packageManager: 'npm',
    hasGit: false,
    projectName: path.basename(projectPath)
  };

  // Check for Git
  info.hasGit = await fs.pathExists(path.join(projectPath, '.git'));

  // Check for package.json (Node.js)
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    try {
      const packageJson = await fs.readJson(packageJsonPath);
      info.type = 'nodejs';
      info.projectName = packageJson.name || info.projectName;
      info.runtime = 'Node.js';
      
      // Detect package manager
      if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) {
        info.packageManager = 'yarn';
      } else if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
        info.packageManager = 'pnpm';
      }
      
      // Detect frameworks from dependencies
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      if (allDeps.react) info.frameworks.push('React');
      if (allDeps.next) info.frameworks.push('Next.js');
      if (allDeps.vue) info.frameworks.push('Vue.js');
      if (allDeps.angular || allDeps['@angular/core']) info.frameworks.push('Angular');
      if (allDeps.express) info.frameworks.push('Express');
      if (allDeps.fastify) info.frameworks.push('Fastify');
      if (allDeps.nestjs || allDeps['@nestjs/core']) info.frameworks.push('NestJS');
      
      // Detect if TypeScript
      if (allDeps.typescript || await fs.pathExists(path.join(projectPath, 'tsconfig.json'))) {
        info.languages.push('TypeScript');
      } else {
        info.languages.push('JavaScript');
      }
      
    } catch (error) {
      // Invalid package.json, continue with other detection
    }
  }

  // Check for Python
  const pythonFiles = ['requirements.txt', 'pyproject.toml', 'Pipfile', 'setup.py'];
  for (const file of pythonFiles) {
    if (await fs.pathExists(path.join(projectPath, file))) {
      info.type = info.type === 'unknown' ? 'python' : 'multi-language';
      info.languages.push('Python');
      info.runtime = 'Python';
      break;
    }
  }

  // Check for Go
  if (await fs.pathExists(path.join(projectPath, 'go.mod'))) {
    info.type = info.type === 'unknown' ? 'go' : 'multi-language';
    info.languages.push('Go');
    info.runtime = 'Go';
  }

  // Check for Rust
  if (await fs.pathExists(path.join(projectPath, 'Cargo.toml'))) {
    info.type = info.type === 'unknown' ? 'rust' : 'multi-language';
    info.languages.push('Rust');
    info.runtime = 'Rust';
  }

  // Check for Java
  const javaFiles = ['pom.xml', 'build.gradle', 'build.gradle.kts'];
  for (const file of javaFiles) {
    if (await fs.pathExists(path.join(projectPath, file))) {
      info.type = info.type === 'unknown' ? 'java' : 'multi-language';
      info.languages.push('Java');
      info.runtime = 'JVM';
      break;
    }
  }

  // Check for Docker
  if (await fs.pathExists(path.join(projectPath, 'Dockerfile')) || 
      await fs.pathExists(path.join(projectPath, 'docker-compose.yml'))) {
    info.frameworks.push('Docker');
  }

  return info;
}

function generateTechPreferences(projectInfo, config) {
  const languages = projectInfo.languages && projectInfo.languages.length > 0 
    ? projectInfo.languages.join(', ') 
    : 'TBD';
  
  const runtime = projectInfo.runtime || 'TBD';
  const frameworks = projectInfo.frameworks && projectInfo.frameworks.length > 0 
    ? projectInfo.frameworks 
    : [];
  
  const packageManager = projectInfo.type === 'nodejs' 
    ? projectInfo.packageManager 
    : 'N/A';

  return {
    languages,
    runtime,
    frameworks,
    packageManager,
    projectType: projectInfo.type,
    hasGit: projectInfo.hasGit
  };
}

module.exports = { detectProjectInfo, generateTechPreferences };
