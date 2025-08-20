<!-- Powered by BMAD™ Core -->

# review-feasibility

Assess technical feasibility for one or more stories in an epic and populate the `Dev Feasibility` section in each story file.

## Inputs

```yaml
required:
   - epic: "{epicNum}" # e.g., "1"

optional:
   - stories: "{csv of story numbers}" # e.g., "1,3,4"; if omitted, process all stories of the epic
   - story_root: from `bmad-core/core-config.yaml` key `devStoryLocation`
```

## Preconditions

-  Story files exist under `devStoryLocation` following pattern `{epic}.{story}.*.md`

## Process

1. Load core config and locate story files

-  Read `.bmad-core/core-config.yaml`
-  Resolve `devStoryLocation`
-  Determine target stories:
   -  If `stories` provided → parse as list
   -  Else → enumerate all stories in the epic

2. For each story, analyze feasibility

-  Read sections: `Story`, `Acceptance Criteria`, `Tasks / Subtasks`, `Dev Notes`
-  Identify:
   -  Ambiguities or missing info blocking implementation
   -  Technical risks or constraints
   -  Unstated dependencies (internal/external)
   -  Scope/sequence issues versus dependencies/priority
   -  Readiness: Feasible | Concerns | Blocked (with reason)

3. Update story file: `Dev Feasibility` section

-  Create `## Dev Feasibility` if missing (below `## Story`)
-  Overwrite the section content with the following template:

```markdown
## Dev Feasibility

Status: {Feasible|Concerns|Blocked}

Ambiguities/Missing Info:

-  ...

Technical Risks/Constraints:

-  ...

Unstated Dependencies:

-  ...

Readiness Notes:

-  1–2 line justification
```

4. Summary output

-  Print a concise table to console/chat:

```text
Epic {epic}
Story | Feasibility | Notes
----- | ----------- | -----
{epic}.{story} | {Feasible|Concerns|Blocked} | {short note}
```

## Completion

-  All targeted stories have `Dev Feasibility` updated
-  Summary table provided

## Notes

-  Only operate on stories with Status = `Dev Feedback`; skip others
-  Do not modify other story sections
-  If a story file is missing or malformed, skip and include in summary with reason
