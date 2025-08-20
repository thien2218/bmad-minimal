<!-- Powered by BMAD™ Core -->

# Develop Story Task

## Purpose

Implement an Approved story end-to-end using test-driven development (TDD), following the story's Tasks/Subtasks with the following formal workflow.

## Inputs

```yaml
required:
   - story_id: "{epic}.{story}" # e.g., "1.3"
   - story_path: "{devStoryLocation}/{epic}.{story}.*.md" # Path from core-config.yaml
```

## Prerequisites

-  Story status must be "Approved".

## SEQUENTIAL Task Execution (Do not proceed until current Task is complete)

### 0. Load Core Configuration and Inputs

-  Load `.bmad-core/core-config.yaml`
-  Extract key configurations: `devStoryLocation`, `qa.*`, `workflow.*`
-  Resolve and load the target story file using `story_id` and `story_path`

### 1. Check if story status is "Approved"

-  If status is not `Approved`, HALT and inform the user why execution cannot proceed.

### 2. Read first or next task

-  Parse the story's "Tasks / Subtasks" list
-  Select the first incomplete task/subtask in order
-  Output: Selected task/subtask to work on

### 3. Write test cases' descriptions

-  For the selected task/subtask, write clear test case descriptions specifying expected logic and observable outcomes
-  Prefer Given-When-Then phrasing for clarity
-  Record these under `Dev Agent Record` as a subsection "Test Case Descriptions" referencing the task/subtask
-  Output: Test case descriptions recorded in the story

### 4. Write test cases implementable with mocks

-  Implement the tests based on the descriptions, using mocks/stubs where appropriate
-  Keep tests isolated and deterministic
-  Output: Test files/cases added

### 5. Implement the task and its subtasks

-  Write production code to satisfy the tests
-  Keep changes scoped to the current task/subtask
-  Update `File List` with files created/modified (paths relative to repo root)
-  Output: Implementation ready for validation

### 6. Repeat until all tasks/subtasks complete

-  If any task/subtask remains incomplete, repeat Steps 2–5
-  Output: All tasks/subtasks completed for this pass, or continue loop

### 7. Execute validations

-  Run `*run-tests`
-  Execute dependency task: `validate-next-story.md`
-  Execute `execute-checklist` with checklist `story-dod-checklist`
-  If failures occur and they are not due to incorrect tests, fix the corresponding implementation and retry (max 3 attempts; on 3rd failure set Status = `Blocked` and HALT)
-  Output: Validation results and updated status (if changed)

### 8. Mark checkboxes and update story

-  Mark completed Tasks/Subtasks with `[x]`
-  Update the story file sections allowed for Dev Agent updates (see config below)
-  Only toggle `- [ ]` → `- [x]`; do not rename, reorder, or edit task text
-  Output: Updated story file saved

## Allowed Story Sections for Update (by Dev Agent)

-  Tasks / Subtasks Checkboxes
-  Dev Agent Record
-  Dev Agent Record/Checkboxes
-  Dev Agent Record/Debug Log References
-  Dev Agent Record/Completion Notes List
-  File List
-  Change Log
-  Status
-  Agent Model Used

## Blocked Conditions

HALT and set Status to `Blocked` if any apply:

-  Unapproved dependencies needed (confirm with user)
-  Ambiguity remains after story check
-  Three consecutive implementation/fix failures
-  Missing configuration
-  Failing regression

## Completion

Declare implementation complete only when all items below are true:

-  All Tasks and Subtasks are marked `[x]` and have tests
-  Validations and full regression pass
-  File List is complete
-  `execute-checklist` has been run with checklist `story-dod-checklist`
-  Story Status is updated: `Blocked` if any blocking condition is met, `Ready for Review` otherwise
-  HALT

## Dependencies

-  Tasks: `execute-checklist.md`, `validate-next-story.md`
-  Checklists: `story-dod-checklist.md`

## Principles

-  Follow TDD: write tests (description → code) before implementation
-  Keep edits minimal and localized; update only the allowed sections of the story
-  If story context is insufficient, stop and request clarification rather than assuming details
