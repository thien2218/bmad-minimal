# Document Existing Project Task

This task defines a systematic workflow to analyze existing project artifacts and create a comprehensive PRD using the established template-driven process.

## Purpose

- Inventory and analyze existing project artifacts (README, package.json, code, docs)
- Harvest project context, goals, and requirements through structured elicitation
- Create a production-ready PRD following the established template
- Ensure seamless integration with downstream Analyst/Architect/PDM workflows

## Inputs

Minimum to proceed:

- `project_identifier` - Project name or identifier for PRD title
- `existing_artifact_paths` - List of paths to analyze (README, package.json, docs, code directories)

Helpful (optional):

- Known goals or success metrics
- Target user personas or market context
- Technical constraints or preferences
- Timeline or resource constraints

## Process

### Step 1: CONFIG-LOAD

Load core configuration and resolve documentation paths.

**Actions:**

- Load `config.json` and verify docs directory structure
- Resolve `@docs.dir`, `@docs.files.prd`, and related paths
- Validate access to template and data files

### Step 2: DISCOVER-ARTIFACTS

Analyze existing project artifacts to understand current state.

**Actions:**

- Scan provided `existing_artifact_paths` for project artifacts
- Analyze README.md for project description, setup instructions, and known issues
- Examine package.json for dependencies, scripts, and project metadata
- Review existing docs/ directory for any current specifications or architecture documents
- Identify technology stack from dependencies and configuration files
- Note any existing patterns, conventions, or architectural decisions

**Output Summary:**

- Project type and primary technologies identified
- Existing functionality and features discovered
- Current documentation status and gaps
- Notable patterns, conventions, or constraints

### Step 3: CONTEXT-SUMMARY

Elicit comprehensive project context from user.

**Elicitation Areas:**

- Project goals and success metrics
- Target users and market context
- Key problems being solved
- Business objectives and constraints
- Timeline and resource considerations

**Process:**

- Present artifact analysis summary from Step 2
- Use advanced elicitation (1-9 menu) for each context area
- Capture user's vision and strategic objectives
- Document assumptions and constraints

### Step 4: REQUIREMENTS-HARVEST

Extract and structure functional and non-functional requirements.

**Actions:**

- Derive functional requirements from project goals and existing functionality
- Identify non-functional requirements (performance, security, usability)
- Map dependencies and integration points
- Assess risks and mitigation strategies
- Define scope boundaries and success criteria

**Elicitation Process:**

- Present initial requirements harvested from artifacts
- Use elicitation to refine, validate, and expand requirements
- Prioritize requirements by importance and dependency
- Identify any gaps or conflicts

### Step 5: EPIC-LIST-INITIALIZE

Initialize the epic list with no items.

**Actions:**

- Set Epic List to an empty list in the PRD (do not invent placeholder epics)
- Defer epic creation until deliberate planning is conducted
- Note that epics will be added later via explicit user-driven planning

### Step 6: CREATE-PRD

Invoke template-driven PRD creation with pre-filled context.

**Actions:**

- Execute `create-doc.md` subtask with `template=prd-tmpl.yaml`
- Pre-populate template sections with harvested context:
  - Project metadata and identifiers
  - Goals and background context
  - Functional and non-functional requirements
  - Success metrics and constraints
- Use advanced elicitation for sections requiring user input
- Ensure all template sections are addressed systematically

### Step 7: HANDOFF

Provide completion summary and next-step guidance.

**Handoff Contents:**

- PRD creation confirmation with file location
- Summary of key decisions and requirements captured
- Artifact analysis summary and coverage metrics
- Recommended next steps:
  - Analyst review and refinement
  - Architectural planning for technical gaps
  - Story creation and development planning
- Integration points with existing workflows

## Integration Points

- **Analyst Workflow:** PRD serves as foundation for epic and story creation
- **Architect Workflow:** Technical requirements guide architecture document creation
- **PDM Workflow:** PRD epics inform adhoc epic and story creation
- **QA Workflow:** Requirements provide basis for test planning and validation

## Quality Criteria

- All existing artifacts analyzed and key insights captured
- PRD follows template structure
- Requirements are complete, traceable, and prioritized
- Epic list initialized (empty, no invented content)
- Clear handoff with actionable next steps
