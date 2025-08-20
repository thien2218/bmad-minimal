<!-- Powered by BMAD™ Core -->

# assess-testing

Assess testing strategy readiness for one or more stories and populate the `QA Assessment` section. Optionally set Status to `Draft` when ready for owner review.

## Inputs

```yaml
required:
   - epic: "{epicNum}" # e.g., "1"

optional:
   - stories: "{csv of story numbers}" # e.g., "1.1,1.3"; if omitted, process all stories of the epic
   - story_root: from `bmad-core/core-config.yaml` key `devStoryLocation`
```

## Preconditions

-  Only operate on story files with `Status: QA Assessment` (skip others)

## Process

1. Load core config and locate target stories
2. For each story in scope:
   -  Read `Story`, `Acceptance Criteria`, `Tasks / Subtasks`, `Dev Feasibility`
   -  Evaluate testability (controllability, observability, debuggability)
   -  Recommend test levels and priorities referencing `tasks/test-design.md` and `core/data/test-priorities-matrix.md`
   -  Identify gaps vs ACs and NFRs; note security/performance/reliability concerns
   -  Decide readiness: Ready for Draft | Needs Changes (with a 1–2 line reason)
3. Update `QA Assessment` section content using the template below
4. If Ready for Draft → set `Status: Draft`; else leave status unchanged

## QA Assessment Section Template

```markdown
## QA Assessment

Readiness: {Ready for Draft|Needs Changes}

Testability:

-  Controllability: {notes}
-  Observability: {notes}
-  Debuggability: {notes}

Recommended Testing:

-  Levels: {unit/integration/e2e}
-  Priorities: {P0/P1/P2/P3 summary}

Notes:

-  1–2 line rationale
```

## Completion

-  Updated `QA Assessment` for all eligible stories
-  Status set to `Draft` for stories deemed Ready for Draft
-  Summary printed listing updated stories and outcomes

## Notes

-  Do not modify other sections
-  If a story file is missing or malformed, skip and include in summary with reason
