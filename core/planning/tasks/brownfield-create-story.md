<!-- Powered by BMAD™ Core -->

# Create Brownfield Story Task

## Purpose

Create a single user story for very small brownfield enhancements that can be completed in one focused development session. This task is for minimal additions or bug fixes that require existing system integration awareness.

## When to Use This Task

**Use this task when:**

-  The enhancement can be completed in a single story
-  No new architecture or significant design is required
-  The change follows existing patterns exactly
-  Integration is straightforward with minimal risk
-  Change is isolated with clear boundaries

**Use brownfield-create-epic when:**

-  The enhancement requires 2-3 coordinated stories
-  Some design work is needed
-  Multiple integration points are involved

**Use the full brownfield PRD/Architecture process when:**

-  The enhancement requires multiple coordinated stories
-  Architectural planning is needed
-  Significant integration work is required

## Instructions

### 1. Quick Project Assessment

Gather minimal but essential context about the existing project:

**Current System Context:**

-  [ ] Relevant existing functionality identified
-  [ ] Technology stack for this area noted
-  [ ] Integration point(s) clearly understood
-  [ ] Existing patterns for similar work identified

**Change Scope:**

-  [ ] Specific change clearly defined
-  [ ] Impact boundaries identified
-  [ ] Success criteria established

### 2. Story Creation (YAML + File Naming)

Create a single focused story and save it as a YAML file using this naming convention:

-  Destination path: `{@docs.subDirs.stories}/standln-{story_enhancement_number}-*.yaml`
-  Choose a short, kebab-case slug for `*` that describes the enhancement (e.g., `-login-redirect-fix`).

Use the following YAML template (aligned with core/engineering/schemas/story.json):

```
# Brownfield Story (YAML)
story:
  id: "standln-{story_enhancement_number}"
  title: "{Specific Enhancement} - Brownfield Addition"
  status: Draft
  priority: "{1-5}"
  statement: "As a {user_role}, I want {specific_action}, so that {benefit}."

acceptance_criteria:
  - "{Primary functional requirement}"
  - "{Secondary functional requirement (if any)}"
  - "{Integration requirement}"

tasks_subtasks:
  - "- [ ] Task 1 (AC: #) [Diff: 1-10]"
  - "  - [ ] Subtask 1.1 [Diff: 1-10]"
  - "- [ ] Task 2 (AC: #) [Diff: 1-10]"

dev_notes:
  doc_impact_summary: "{Updated PRD sections: ..., Architecture: ... | No updates needed}"
  testing_standards:
    - "{test standard 1}"
    - "{test standard 2}"
  previous_story_insights: "{prior insights if any}"
  data_models:
    value: "{data models used}"
    source: "{@docs.dir}/<scope>-architecture.md#{section}"
  api_specifications:
    value: "{API specs}"
    source: "{@docs.dir}/<scope>-architecture.md#{section}"
  component_specifications:
    value: "{component specs}"
    source: "{@docs.dir}/<scope>-architecture.md#{section}"
  file_locations:
    value: "{file paths and naming conventions}"
    source: "{@docs.dir}/<scope>-architecture.md#{section}"
  testing_requirements:
    value: "{testing requirements}"
    source: "{@docs.dir}/<scope>-architecture.md#{section}"
  technical_constraints:
    value: "{constraints}"
    source: "{@docs.dir}/<scope>-architecture.md#{section}"
  notes_missing_guidance: "If a category lacks architecture guidance, state: 'No specific guidance found in architecture docs'."

test_specs:
  specs:
    - "1: [AC 1] Given ..., When ..., Then ..."
  artifacts:
    - path: "path/to/test_file"
      purpose: "what it covers"

risk_mitigation:
  primary_risk: "{main risk}"
  mitigation_strategies:
    - "{strategy 1}"
    - "{strategy 2}"
  rollback_plan: "{how to undo if needed}"

change_log:
  - date: "{YYYY-MM-DD}"
    version: "{v0.1}"
    description: "Initial draft"
    author: "{name}"

developer_record:
  agent_model: "{agent_model_name_version}"
  debug_log_references: []
  completion_notes: []
  file_list: []

qa_results: ""
```

### 3. PM Document Impact Assessment

Evaluate whether this story has any impact on the PRD and/or architecture documents. Only update the affected parts; if the change is small with no lasting impact, do not update any documents.

-  PRD: update relevant sections (e.g., scope, requirements, constraints) if behavior or requirements change
-  Architecture: update affected files/sections (e.g., `{@docs.files.feArchitecture}`, `{@docs.files.beArchitecture}`, `{@docs.files.fsArchitecture}`) if component responsibilities, data models, APIs, or patterns are affected
-  Record a brief note in the story YAML under `dev_notes.doc_impact_summary` summarizing any documentation updates (or state "No updates needed")

Checklist:

-  [ ] PRD impact assessed; impacted sections listed (or "none")
-  [ ] PRD updated where applicable (include date/version), or explicitly confirmed "no updates"
-  [ ] Architecture impact assessed; impacted files/sections identified (or "none")
-  [ ] Architecture docs updated where applicable, or explicitly confirmed "no updates"
-  [ ] Story Technical Notes updated with a one-line summary of doc impact decision
-  [ ] Confirm no new architecture/design introduced; if required, escalate to brownfield-create-epic or full PRD/Architecture
-  [ ] Save any updated docs to {@docs.dir}

### 4. Risk and Compatibility Check

**Minimal Risk Assessment:**

-  **Primary Risk:** {{main risk to existing system}}
-  **Mitigation:** {{simple mitigation approach}}
-  **Rollback:** {{how to undo if needed}}

**Compatibility Verification:**

-  [ ] No breaking changes to existing APIs
-  [ ] Database changes (if any) are additive only
-  [ ] UI changes follow existing design patterns
-  [ ] Performance impact is negligible

### 5. Validation Checklist

Before finalizing the story, confirm:

**Scope Validation:**

-  [ ] Story can be completed in one development session
-  [ ] Integration approach is straightforward
-  [ ] Follows existing patterns exactly
-  [ ] No design or architecture work required

**Clarity Check:**

-  [ ] Story requirements are unambiguous
-  [ ] Integration points are clearly specified
-  [ ] Success criteria are testable
-  [ ] Rollback approach is simple

## Success Criteria

The story creation is successful when:

1. Enhancement is clearly defined and appropriately scoped for single session
2. Integration approach is straightforward and low-risk
3. Existing system patterns are identified and will be followed
4. Rollback plan is simple and feasible
5. Acceptance criteria include existing functionality verification
6. Story file is created at `{@docs.subDirs.stories}/standln-{story_enhancement_number}-*.yaml`
7. PRD and/or architecture docs are updated where impacted, or explicitly confirmed as not requiring updates

## Important Notes

-  This task is for VERY SMALL brownfield changes only
-  If complexity grows during analysis, escalate to brownfield-create-epic
-  Always prioritize existing system integrity
-  When in doubt about integration complexity, use brownfield-create-epic instead
-  Stories should take no more than 4 hours of focused development work
