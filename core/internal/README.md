# BMAD Core Schemas

## ⚠️ INTERNAL USE ONLY

These JSON schemas are for internal validation and tooling purposes only. **Agents should NOT reference or load these schema files directly**. They are used to validate the structure of YAML/JSON versions of tasks, checklists, and data files.

## Purpose

These schemas define the structure for YAML/JSON versions of BMAD core artifacts:

-  **checklist.schema.json** - Structure for checklist definitions
-  **task.schema.json** - Structure for task definitions
-  **data.schema.json** - Structure for data files

## Usage

### For Validation (Development/CI)

```bash
# Example: Validate a task YAML file
ajv validate -s core/schemas/task.schema.json -d core/tasks/develop-story.yaml

# Example: Validate all checklists
ajv validate -s core/schemas/checklist.schema.json -d "core/checklists/*.yaml"
```

### Schema References in Files

When creating YAML versions of tasks, checklists, or data, include a schema reference:

```yaml
id: develop-story
title: Develop Story Task
version: 1.0.0
# ... rest of the task definition
```

## Schema Versions

All schemas use JSON Schema Draft-07 specification.

## Important Notes

1. **Agents continue to use Markdown files** - These schemas are for future YAML/JSON versions
2. **Do not expose schema paths to agents** - Schemas are implementation details
3. **Backward compatibility** - Existing Markdown files remain the source of truth until migrated
4. **Validation only** - Schemas enforce structure but don't execute logic

## Migration Strategy

The migration from Markdown to YAML/JSON will be gradual:

1. Phase 1: Schemas created (current)
2. Phase 2: YAML/JSON versions created alongside Markdown
3. Phase 3: Agents updated to prefer structured formats
4. Phase 4: Markdown files become human-readable only

## File Structure Mapping

| Markdown Location     | Future YAML/JSON Location | Schema                |
| --------------------- | ------------------------- | --------------------- |
| core/tasks/\*.md      | core/tasks/\*.yaml        | task.schema.json      |
| core/checklists/\*.md | core/checklists/\*.yaml   | checklist.schema.json |
| core/data/\*.md       | core/data/\*.yaml         | data.schema.json      |

## Schema Features

### Task Schema

-  Structured inputs/outputs with types
-  Step-by-step process definition
-  Prerequisites and dependencies
-  Completion criteria and validations

### Checklist Schema

-  Item dependencies and verification methods
-  Progress tracking support
-  Required vs optional items
-  Categories and scoping

### Data Schema

-  Flexible content types (preferences, frameworks, standards, etc.)
-  Usage metadata (which agents, when to load)
-  Validation constraints
-  Versioning and deprecation support

## Extending Schemas

To add new fields or modify schemas:

1. Update the appropriate schema file
2. Increment schema version in `$id`
3. Validate existing files still pass
4. Document changes in this README

## Tools

Recommended tools for working with these schemas:

-  **ajv-cli** - Command-line JSON Schema validator
-  **VS Code** - Auto-completion and validation with YAML/JSON files
-  **spectral** - API linting that supports JSON Schema

## Contact

For questions about these schemas, consult the BMAD Core team or project maintainers.
