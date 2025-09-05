# BMAD Minimal

BMAD Minimal is a lightweight, batteries-included starter for running BMAD (Bright Method for AI-Driven Development) processes inside any codebase. It ships a curated core of planning and engineering assets (agents, tasks, checklists, data, templates) and a simple CLI to install/update them into your repository.

The CLI copies the core content into your project and scaffolds a docs structure so your team (or AI agents) can execute consistent, repeatable workflows.

## Requirements

-  Node.js 16+ and npm
-  Run the CLI from the root of the target repository

## Quick Start

Install the core assets and docs structure into your project. This is safe to run in any repo you control.

```bash
# Recommended: always use the latest version
npx bmad-minimal@latest install

# Or accept prompts automatically when npm asks to install the package
npx -y bmad-minimal install
```

During installation you will be prompted for:

-  Project name
-  Whether your app is singular (single app dir) or split into backend/frontend
-  App directory (or backend/frontend directories)
-  Base directory for BMAD files (default: `.bmad-minimal`)
-  Whether to include planning templates (default: Yes)
-  Documentation directory (default: `docs`)
-  Whether to generate a technical-preferences authoring prompt

At least one of: App, Backend, or Frontend directory must be provided.

What gets created:

```
.bmad-minimal/
├── config.json
├── engineering/
├── planning/                 # only if you selected Include planning templates
└── .gitignore

docs/
├── qa/
├── epics/
├── stories/
├── brownfield/
└── technical-preferences.md
```

The CLI also merges your answers into `.bmad-minimal/config.json` based on the default template in `core/config.json`.

## Updating to the Latest Core

Pull in the latest planning/engineering assets while preserving your configuration.

```bash
# Interactive (asks for confirmation)
npx bmad-minimal@latest update

# Non-interactive (skip confirmation)
npx bmad-minimal@latest update --force
```

-  Preserves: `.bmad-minimal/config.json`
-  Overwrites with latest: `.bmad-minimal/engineering/` and, if present, `.bmad-minimal/planning/`
-  Ensures `docs/` subdirectories exist and refreshes `technical-preferences.md` from the template if found

## Command Reference

The CLI is defined in `bin/cli.js` and exposes two commands:

-  `install`

   -  Description: Install BMAD Minimal configuration and documentation structure
   -  Options:
      -  `-p, --project <name>` Project name (defaults to current folder name if not provided)
      -  `-d, --dir <path>` Base directory for BMAD files (default: `.bmad-minimal`)

-  `update`
   -  Description: Update documentation to the latest version while preserving `config.json`
   -  Options:
      -  `-f, --force` Force update without confirmation

Examples:

```bash
# Install with custom project name and base dir
npx bmad-minimal@latest install \
  --project "Acme Shop" \
  --dir .bmad-minimal

# Update without prompts
npx bmad-minimal@latest update --force
```

## What’s Included

Content under `.bmad-minimal/` directory during install will include:

-  Engineering

   -  Agents (`core/engineering/agents/`): operating guides for `dev`, `pdm`, and `qa`
   -  Tasks (`core/engineering/tasks/`): executable YAML workflows (e.g., `develop-story.yaml`, `test-design.yaml`)
   -  Checklists (`core/engineering/checklists/`): quality gates (e.g., `story-dod-checklist.yaml`)
   -  Data (`core/engineering/data/`): structured knowledge (e.g., `test-levels-framework.yaml`)
   -  Schemas (`core/engineering/schemas/`): JSON structures for story/epic/QA gate

-  Planning (optional)

   -  Agents (`core/planning/agents/`): `pm`, `architect`, `ux-expert`
   -  Tasks (`core/planning/tasks/`): PM/Architecture task flows
   -  Checklists (`core/planning/checklists/`): e.g., Architect Validation
   -  Templates (`core/planning/templates/`): PRD and architecture templates
   -  Workflows (`core/planning/workflows/`): greenfield/brownfield flows

-  Configuration
   -  `core/config.json` → used to seed `.bmad-minimal/config.json` (paths for docs, subdir names, etc.)

## Troubleshooting

-  Update says "No BMad Minimal configuration found":

   -  Run `npx bmad-minimal install` first in the repository root.

-  Install aborts with "provide at least one of App, Backend, or Frontend directory":

   -  Re-run install and provide `App directory`, or `Backend` and/or `Frontend` directories when prompted.

-  Where did my docs go?

   -  The docs directory defaults to `docs/`. You can customize this during install. Subdirectories (`qa/`, `epics/`, `stories/`, `brownfield/`) are created for you.

## License

ISC

## Links

-  Repository: https://github.com/thien2218/bmad-minimal
-  Issues: https://github.com/thien2218/bmad-minimal/issues
