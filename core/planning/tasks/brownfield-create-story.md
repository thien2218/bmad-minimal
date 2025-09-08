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

-  Destination path: `{@docs.subdirs.stories}/standln-{story_enhancement_number}-*.yaml`
-  Choose a short, kebab-case slug for `*` that describes the enhancement (e.g., `login-redirect-fix`).

Use the following YAML template to create story file with YAML format (aligned with core/engineering/schemas/story.json):

```json
{
	"template": {
		"id": "story-template-v2",
		"name": "Story Document",
		"version": "2.0",
		"output": {
			"format": "json",
			"filename": "{@docs.subdirs.stories}/standln-{{story_enhancement_number}}-{{story_title_short}}.json",
			"title": "Story {{story_enhancement_number}}: {{story_title_short}}"
		}
	},
	"workflow": {
		"mode": "interactive",
		"elicitation": "advanced-elicitation"
	},
	"sections": [
		{
			"id": "status",
			"title": "Status",
			"type": "choice",
			"choices": [
				"Draft",
				"Spec Review",
				"WIP",
				"Blocked",
				"Review",
				"Done"
			],
			"instruction": "Select the current status of the story",
			"owner": "product-development-master",
			"editors": [
				"product-development-master",
				"product-master",
				"developer",
				"qa-agent"
			]
		},
		{
			"id": "priority",
			"title": "Priority",
			"type": "choice",
			"choices": ["1", "2", "3", "4", "5"],
			"instruction": "Story priority (1 = highest). Used by PDM for sequencing.",
			"owner": "product-development-master",
			"editors": ["product-development-master", "product-master"]
		},
		{
			"id": "story",
			"title": "Story",
			"type": "template-text",
			"template": "**As a** {{role}},\n**I want** {{action}},\n**so that** {{benefit}}",
			"instruction": "Define the user story using the standard format with role, action, and benefit",
			"elicit": true,
			"owner": "product-development-master",
			"editors": ["product-development-master", "product-master"]
		},
		{
			"id": "acceptance-criteria",
			"title": "Acceptance Criteria",
			"type": "numbered-list",
			"instruction": "Copy the acceptance criteria numbered list from the epic file",
			"elicit": true,
			"owner": "product-development-master",
			"editors": ["product-development-master", "product-master"]
		},
		{
			"id": "tasks-and-subtasks",
			"title": "Tasks / Subtasks",
			"type": "bullet-list",
			"instruction": "Break down the story into specific tasks and subtasks needed for implementation.\nReference applicable acceptance criteria numbers where relevant.\nAssign a Difficulty for each task and subtask (integer 1–10) capturing both complexity and uncertainty.",
			"template": "- [ ] Task 1 (AC: # if applicable) [Diff: 1-10]\n  - [ ] Subtask 1.1... [Diff: 1-10]\n- [ ] Task 2 (AC: # if applicable) [Diff: 1-10]\n  - [ ] Subtask 2.1... [Diff: 1-10]\n- [ ] Task 3 (AC: # if applicable) [Diff: 1-10]\n  - [ ] Subtask 3.1... [Diff: 1-10]",
			"elicit": true,
			"owner": "product-development-master",
			"editors": [
				"product-development-master",
				"product-master",
				"developer"
			]
		},
		{
			"id": "dev-notes",
			"title": "Dev Notes",
			"instruction": "Leave this section empty at first on initialization as it will be populated later on.\nPopulate relevant information, only what was pulled from actual artifacts from docs folder, relevant to this story:\n- Do not invent information\n- If known add Relevant Source Tree info that relates to this story\n- If there were important notes from previous story that are relevant to this one, include them here\n- Put enough information in this section so that the dev agent should NEVER need to read the architecture documents, these notes along with the tasks and subtasks must give the Dev Agent the complete context it needs to comprehend with the least amount of overhead the information to complete the story, meeting all AC and completing all tasks+subtasks",
			"elicit": true,
			"owner": "product-development-master",
			"editors": ["product-development-master", "product-master"]
		},
		{
			"id": "testing-standards",
			"title": "Testing",
			"instruction": "List Relevant Testing Standards from Architecture the Developer needs to conform to:\n- Test file location\n- Test standards\n- Testing frameworks and patterns to use\n- Any specific testing requirements for this story",
			"elicit": true,
			"owner": "product-development-master",
			"editors": ["product-development-master", "product-master"]
		},
		{
			"id": "test-specs",
			"title": "Test Specs",
			"instruction": "Maintain both test specifications and a list of relevant test files for this story.",
			"owner": "qa-agent",
			"editors": ["qa-agent", "developer"],
			"sections": [
				{
					"id": "specs",
					"title": "Specifications",
					"type": "numbered-list",
					"instruction": "List concise Given-When-Then (or equivalent) specs. Include AC references.",
					"template": "{{spec_number}}: [AC {{ac_numbers}}] {{short_description}} — Given {{given}}, When {{when}}, Then {{then}}",
					"elicit": true
				},
				{
					"id": "artifacts",
					"title": "Artifacts",
					"type": "bullet-list",
					"instruction": "List existing or planned test files relevant to this story (paths with brief purpose).",
					"template": "- {{path}} — {{purpose}}",
					"elicit": false
				}
			]
		},
		{
			"id": "risk-mitigation",
			"title": "Risk Mitigation",
			"instruction": "Document risks and mitigation strategies for this story implementation.",
			"owner": "product-development-master",
			"editors": ["product-development-master", "product-master"],
			"sections": [
				{
					"id": "primary-risk",
					"title": "Primary Risk",
					"type": "paragraph",
					"instruction": "Describe the main risk this story poses to the existing system and users.",
					"elicit": true
				},
				{
					"id": "mitigation-strategies",
					"title": "Mitigation Strategies",
					"type": "bullet-list",
					"instruction": "List concrete mitigation actions to reduce likelihood/impact of the risk.",
					"template": "- {{mitigation_action}}",
					"elicit": true
				},
				{
					"id": "rollback-plan",
					"title": "Rollback Plan",
					"type": "paragraph",
					"instruction": "Outline how to quickly revert changes if needed, including preconditions and steps.",
					"elicit": true
				}
			]
		},
		{
			"id": "change-log",
			"title": "Change Log",
			"type": "table",
			"columns": ["Date", "Version", "Description", "Author"],
			"instruction": "Track changes made to this story document",
			"owner": "product-development-master",
			"editors": [
				"product-development-master",
				"product-master",
				"developer",
				"qa-agent"
			]
		},
		{
			"id": "developer-record",
			"title": "Dev Agent Record",
			"instruction": "This section is populated by the development agent during implementation",
			"owner": "developer",
			"editors": ["developer"],
			"sections": [
				{
					"id": "agent-model",
					"title": "Agent Model Used",
					"template": "{{agent_model_name_version}}",
					"instruction": "Record the specific AI agent model and version used for development",
					"owner": "developer",
					"editors": ["developer"]
				},
				{
					"id": "debug-log-references",
					"title": "Debug Log References",
					"instruction": "Reference any debug logs or traces generated during development",
					"owner": "developer",
					"editors": ["developer"]
				},
				{
					"id": "completion-notes",
					"title": "Completion Notes List",
					"instruction": "Notes about the completion of tasks and any issues encountered",
					"owner": "developer",
					"editors": ["developer"]
				},
				{
					"id": "file-list",
					"title": "File List",
					"instruction": "List all files created, modified, or affected during story implementation",
					"owner": "developer",
					"editors": ["developer"]
				}
			]
		},
		{
			"id": "qa-results",
			"title": "QA Results",
			"instruction": "Results from QA Agent QA review of the completed story implementation",
			"owner": "qa-agent",
			"editors": ["qa-agent"]
		}
	]
}
```

### 3. Document Impact Assessment

Evaluate whether this story has any impact on the PRD and/or architecture documents. Only update the affected parts; if the change is small with no lasting impact, do not update any documents.

-  PRD: update relevant sections (e.g., scope, requirements, constraints) if behavior or requirements change
-  Architecture: update affected files/sections (e.g., `{@docs.files.feArchitecture}`, `{@docs.files.beArchitecture}`, `{@docs.files.fsArchitecture}`) if component responsibilities, data models, APIs, or patterns are affected
-  Record a brief note in the story YAML under `dev-notes` summarizing any documentation updates (or state "No updates needed")

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
6. Story file is created at `{@docs.subdirs.stories}/standln-{story_enhancement_number}-*.yaml`
7. PRD and/or architecture docs are updated where impacted, or explicitly confirmed as not requiring updates

## Important Notes

-  This task is for VERY SMALL brownfield changes only
-  If complexity grows during analysis, escalate to brownfield-create-epic
-  Always prioritize existing system integrity
-  When in doubt about integration complexity, use brownfield-create-epic instead
-  Stories should take no more than 4 hours of focused development work
