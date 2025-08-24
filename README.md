# BMAD Minimal

A streamlined CLI tool for setting up BMAD (Better Method for AI Development) workspaces. This tool creates an organized, AI-friendly project structure that helps teams collaborate effectively with AI-assisted development tools.

## Features

🚀 **Quick Setup**: One command to create a complete BMAD workspace  
🔍 **Auto-Detection**: Automatically detects your project technology stack  
⚙️ **Configurable**: Customize folder locations and features  
🎯 **IDE-Friendly**: Optimized for AI-assisted IDEs like Cursor and Windsurf  
📝 **Pre-filled Templates**: Generate technical preferences based on your project  
🌳 **Git Integration**: Automatic git initialization with proper .gitignore  

## Installation

```bash
# Install BMAD workspace (recommended)
npx @thienhuynh/bmad-minimal install

# Or install globally
npm install -g @thienhuynh/bmad-minimal
bmad-minimal install
```

## Usage

### Install Command

```bash
# Create workspace in current directory
npx @thienhuynh/bmad-minimal install
npx @thienhuynh/bmad-minimal i  # short alias

# Create workspace in specific directory
npx @thienhuynh/bmad-minimal install /path/to/project

# Skip interactive prompts (use defaults)
npx @thienhuynh/bmad-minimal install -y

# Backward compatibility - install is default command
npx @thienhuynh/bmad-minimal  # same as 'install'
```

### Update Command

```bash
# Update existing workspace to latest version
npx @thienhuynh/bmad-minimal update
npx @thienhuynh/bmad-minimal u  # short alias

# Update specific workspace directory
npx @thienhuynh/bmad-minimal update /path/to/bmad-minimal

# Skip confirmation prompts
npx @thienhuynh/bmad-minimal update -y

# Update without creating backup
npx @thienhuynh/bmad-minimal update --no-backup
```

### Interactive Setup

When you run the command, you'll be prompted to configure:

1. **Planning Files**: Whether to include planning folder for web-based planning
2. **Documentation Location**: Where to store documentation files (default: `docs`)
3. **Epic Files Location**: Where to store epic files (default: `docs/epics`)
4. **Story Files Location**: Where to store story files (default: `docs/stories`)
5. **QA Files Location**: Where to store QA files (default: `docs/qa`)

## Workspace Structure

The tool creates the following structure:

```
bmad-minimal/
├── .agents/              # Agent configurations (hidden from AI IDEs)
│   ├── config.json      # Agent settings
│   └── README.md        # Agent documentation
├── .bmad-core/          # Core BMAD files (hidden from AI IDEs)
│   ├── config.json      # BMAD configuration
│   ├── technical-preferences.md  # Auto-generated tech preferences
│   └── docs/            # Documentation structure
│       ├── prd.md       # Product Requirements Document
│       ├── architecture.md  # Architecture document
│       ├── prd/         # Sharded PRD files
│       ├── architecture/ # Sharded architecture files
│       ├── epics/       # Epic files
│       ├── stories/     # Story files
│       └── qa/          # QA files
├── planning/            # Optional: Web-based planning (excluded from git)
│   ├── sessions/        # Planning sessions
│   ├── roadmaps/        # Product roadmaps
│   └── research/        # Research documents
├── .gitignore          # Pre-configured gitignore
└── README.md           # This file
```

## Auto-Detection Features

The CLI automatically detects your project type and pre-fills technical preferences:

### Supported Technologies

- **Node.js**: Detects package.json, frameworks (React, Vue, Angular, Express, etc.)
- **Python**: Detects requirements.txt, pyproject.toml, Pipfile
- **Go**: Detects go.mod
- **Rust**: Detects Cargo.toml
- **Java**: Detects pom.xml, build.gradle
- **Docker**: Detects Dockerfile, docker-compose.yml

### Package Managers

- **npm**: Default for Node.js projects
- **yarn**: Detected via yarn.lock
- **pnpm**: Detected via pnpm-lock.yaml

## Configuration

The generated `config.json` includes:

```json
{
  "root": ".bmad-core/",
  "prd": {
    "file": "docs/prd.md",
    "version": "v4",
    "sharded": true,
    "shardedLocation": "docs/prd"
  },
  "architecture": {
    "file": "docs/architecture.md", 
    "version": "v4",
    "sharded": true,
    "shardedLocation": "docs/architecture"
  },
  "qaLocation": "docs/qa",
  "epic": {
    "location": "docs/epics",
    "fileNamePattern": "epic-{epic_number}-*.yaml"
  },
  "story": {
    "location": "docs/stories", 
    "fileNamePattern": "story-{epic_number}.{story_number}-*.yaml"
  }
}
```

## Why Hidden Folders?

The `.agents` and `.bmad-core` folders are intentionally hidden (dotfiles) to:

- Prevent accidental modifications by AI-assisted IDEs
- Keep the workspace clean and organized
- Ensure consistent agent behavior
- Maintain separation between project code and BMAD configuration

## Update Management

BMAD Minimal includes built-in update functionality to keep your workspace current:

### Version Tracking
- Each workspace includes a `.bmad-version` file to track the installed version
- Update command compares current vs latest version
- Automatic backup creation before updates (can be disabled)

### Update Process
1. **Backup Creation**: Automatically backs up your workspace (excludes .git)
2. **Configuration Preservation**: Maintains your custom folder structure
3. **Template Updates**: Updates core templates with latest improvements
4. **Customization Protection**: Preserves manual changes to technical-preferences.md
5. **Rollback Support**: Can restore from backup if update fails

### What Gets Updated
- Core template files (config.json, agents configuration)
- Auto-generated documentation templates
- .gitignore improvements
- New features and bug fixes

### What's Preserved
- Custom folder configurations
- Manual changes to technical-preferences.md (with backup)
- All your documentation content
- Git history
- Planning files

## CLI Commands

### Install Command
```
Usage: bmad-minimal install [target-directory] [options]

Arguments:
  target-directory     Directory where to create the bmad-minimal workspace (default: ".")

Options:
  -y, --yes           Skip interactive prompts and use defaults
  -h, --help          Display help for command
```

### Update Command
```
Usage: bmad-minimal update [workspace-directory] [options]

Arguments:
  workspace-directory  Directory containing the bmad-minimal workspace (default: "bmad-minimal")

Options:
  -y, --yes           Skip confirmation prompts
      --backup        Create backup before updating (default: true)
      --no-backup     Skip backup creation
  -h, --help          Display help for command
```

## Examples

### New Project Setup

```bash
# In a new empty directory
npx @thienhuynh/bmad-minimal
# Creates bmad-minimal/ with default configuration
```

### Existing Project Integration

```bash
# In an existing Node.js project
cd my-existing-project
npx @thienhuynh/bmad-minimal
# Detects Node.js, React, TypeScript, etc. and pre-fills preferences
```

### Custom Configuration

```bash
# Interactive setup with custom paths
npx @thienhuynh/bmad-minimal
# Follow prompts to customize folder locations
```

### Quick Setup

```bash
# Use defaults, no prompts
npx @thienhuynh/bmad-minimal -y
```

## Integration with AI IDEs

### Cursor

The workspace structure is optimized for Cursor's context system:
- Git repository provides version control context
- Hidden folders prevent AI from modifying core configurations
- Documentation structure helps with code understanding

### Windsurf

Similar benefits for Windsurf and other AI-assisted development tools:
- Organized documentation for better context
- Clear separation of concerns
- Consistent project structure

## Troubleshooting

### Permission Issues

```bash
# If you get permission errors
sudo npm install -g @thienhuynh/bmad-minimal
```

### Git Not Found

If git initialization fails:
```bash
# Install git first
sudo apt-get install git  # Ubuntu/Debian
brew install git          # macOS

# Then re-run the setup
npx @thienhuynh/bmad-minimal
```

### Existing Folder Conflicts

The CLI will prompt you to overwrite existing `bmad-minimal` folders. Choose:
- **Yes**: Remove existing folder and create new one
- **No**: Cancel setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License - see LICENSE file for details.

## Links

- [GitHub Repository](https://github.com/thien2218/bmad-improved)
- [NPM Package](https://www.npmjs.com/package/@thienhuynh/bmad-minimal)
- [Issues](https://github.com/thien2218/bmad-improved/issues)

---

Made with ❤️ for AI-assisted development teams.
