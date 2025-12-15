# Analyze Planning Scope Task

This task defines a repeatable method to evaluate a proposed change/implementation and recommend the appropriate planning scope (1–4), with rationale, impact assessment, and next-step guidance.

## Purpose

- Classify a request into an actionable planning scope level
- Provide a transparent rationale through impact and risk scoring
- Identify which artifacts (PRD, architecture, frontend spec) should be updated
- Recommend next steps aligned with your existing BMAD Minimal workflows

## Supported Scope Levels (Select Exactly One)

1. Major changes that may require rewriting a decent chunk of high level docs (multi-experts level planning)
2. Significant changes which create moderate to large gaps in high level docs (epic level planning)
3. Moderate changes which may or may not create small gaps in high level docs (story level planning)
4. Minimal changes which doesn’t affect the system (agent level planning)

## Inputs

Minimum to proceed:

- Change/implementation summary (1–3 sentences)
- Affected areas (e.g., frontend, backend, data, infra, docs)

Helpful (optional):

- Link(s) to relevant sections of PRD, frontend spec, architecture docs
- Time/constraints, stakeholders impacted, any known risks/unknowns

If information is incomplete, ask these five intake questions:

1. What is the change or implementation you want to make, in 1–3 sentences?
2. What outcome(s) does this change need to achieve (key success criteria)?
3. Which areas are affected (frontend, backend, data, infra, operations, docs)?
4. What is the expected blast radius (how many flows/components/services)?
5. What unknowns or risks do you foresee?

## Process

### Step 1: Context Intake

- Collect/confirm the five intake answers above.
- Identify whether the request is a new capability, an architectural adjustment, or a minor enhancement/fix.

### Step 2: Impact Mapping

Evaluate which artifacts will likely need updates and how much:

- PRD (product scope, epics/stories)
- Frontend Specification (flows, UI behavior)
- Architecture (frontend/back/backend/fullstack)
- Operational/QA docs (if applicable)

### Step 3: Complexity & Risk Scoring (0–3 each)

Score the change across six axes (0 = trivial, 3 = extensive):

1. Documentation Impact
   - 0: No doc change
   - 1: Minor note/one section tweak
   - 2: Multiple sections across one artifact
   - 3: Substantial rewrite across artifacts
2. Breadth of Change
   - 0: Single component/file
   - 1: One flow or service area
   - 2: Multiple flows/services
   - 3: Cross-cutting across major subsystems
3. Cross-Team/Dependency Load
   - 0: None
   - 1: One adjacent team/service
   - 2: Several services/owners
   - 3: Broad, multi-team coordination
4. Unknowns/Research Need
   - 0: None
   - 1: Minor assumptions, easy validation
   - 2: Notable gaps, targeted research required
   - 3: Major unknowns requiring deep research
5. Backward Compatibility/Risk
   - 0: No risk/regression expected
   - 1: Low risk, easy rollback
   - 2: Moderate risk or data/contract change
   - 3: High risk to critical paths or contracts
6. Customer/Business Impact
   - 0: Cosmetic/internal only
   - 1: Small UX/ops improvement
   - 2: Notable user-visible or SLA/ops impact
   - 3: Strategic shift or core experience impact

Compute total score: sum of all six axes (range 0–18).

### Step 4: Scope Recommendation

Use thresholds as guidance (overrides may apply):

- 0–3 → Scope 4 (Agent level)
- 4–7 → Scope 3 (Story level)
- 8–12 → Scope 2 (Epic level)
- 13–18 → Scope 1 (Multi-experts level)

Override rules (apply with judgement):

- If substantial rewrite across high-level docs is evident → Scope 1
- If only a micro-fix/internal refactor with no doc impact → Scope 4
- If single new feature spanning multiple user flows/services → Scope 2
- If bounded enhancement within an existing story’s domain → Scope 3

### Step 5: Output the Recommendation

Produce a concise, structured summary (see Output Format below) including:

- Scope level and one-sentence summary
- Rationale tied to the scoring axes
- Impacted artifacts and the expected type of update
- Actionable next steps aligned with the chosen scope level

### Step 6: Offer Follow-ups

Offer numbered options (user picks by number), for example:

1. Proceed with this scope recommendation
2. Provide more context to refine the assessment
3. Generate a deep research prompt (if Scope 1–2 or major unknowns)
4. Facilitate a brainstorming session (if early-stage ideation helpful)
5. Create a Project Brief (if pivot/new direction forming)
6. Exit

## Output Format (Template)

```markdown
## Planning Scope Recommendation

- Scope Level: [1|2|3|4]
- Summary: [1–2 sentences]

### Rationale

- Documentation Impact: [score 0–3] – [why]
- Breadth of Change: [score 0–3] – [why]
- Cross-Team/Dependency Load: [score 0–3] – [why]
- Unknowns/Research Need: [score 0–3] – [why]
- Backward Compatibility/Risk: [score 0–3] – [why]
- Customer/Business Impact: [score 0–3] – [why]
- Total Score: [0–18]

### Impacted Artifacts (and Expected Updates)

- PRD: [none | minor | multiple sections | substantial rewrite]
- Frontend Spec: [none | minor | multiple sections | substantial rewrite]
- Architecture: [none | FE | BE | FS | multiple]
- Other Docs: [ops, QA, runbooks, etc.]

### Suggested Next Actions

- [Action 1]
- [Action 2]
- [Action 3]
```

## Next Actions by Scope

- Scope 1 (Multi-experts level)

  - Consider: Brainstorming session → Deep Research Prompt → Project Brief
  - Expect: PRD and architecture substantial updates
  - Coordinate: Analyst, Architect, UX, and PDM for alignment
  - Choose a Greenfield workflow (fullstack/ui/service/generic) if direction is shifting

- Scope 2 (Epic level)

  - Update PRD (new/updated epics and stories)
  - Run targeted technical/user research if unknowns scored ≥2
  - Plan architectural updates where needed (FE/BE/FS)

- Scope 3 (Story level)

  - Create/modify story with clear acceptance criteria
  - Minor updates to PRD/spec/architecture as needed (single-section touch)

- Scope 4 (Agent level)
  - Proceed with change; no high-level docs required
  - Optionally add a brief note/changelog if helpful

## Example Mapping (Guidance)

- New module affecting multiple user journeys and services → Scope 1
- Replace auth provider or core data schema → Scope 1
- Add a multi-step funnel across web and API → Scope 2
- Refactor significant feature across 2–3 flows → Scope 2
- Add a field to an existing form and extend one API → Scope 3
- Fix spacing/copy/log level/telemetry tweak → Scope 4
