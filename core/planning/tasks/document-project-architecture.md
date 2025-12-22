# Document Project Architecture Task

This task defines a structured workflow to analyze an existing project and capture its current or target architecture using the established template-driven process.

## Purpose

- Inventory existing architecture artifacts (README, package.json, infra manifests, docs)
- Elicit system context, constraints, and quality attributes from stakeholders
- Document architecture decisions, components, and integration patterns using templates
- Prepare actionable handoff for downstream engineering and planning workflows

## Inputs

Minimum to proceed:

- `project_identifier` - Project name or identifier for architecture doc title
- `existing_artifact_paths` - List of paths to analyze (README, package.json, docs, infrastructure configs, code directories)

Helpful (optional):

- Known system goals or KPIs
- Target deployment environments and operational constraints
- Documented tech stack preferences or mandates
- Current pain points, incidents, or debt items
- Compliance, security, or scalability requirements

## Process

### Step 1: CONFIG-LOAD

Load core configuration and resolve documentation paths.

**Actions:**

- Load `config.json` and verify docs directory structure
- Resolve `@docs.dir`, architecture template paths, and supporting references
- Validate access to data, checklist, and template files needed downstream

### Step 2: DISCOVER-ARTIFACTS

Analyze provided artifacts to understand the current system state.

**Actions:**

- Review README.md for deployment, topology, and integration notes
- Inspect package.json and code structure to determine runtime stacks
- Examine infrastructure-as-code files (Terraform, CloudFormation, Docker) for environment details
- Scan docs/ directory for any architecture, ADR, or topology references
- Note observed patterns (monolith, microservices, layered), integration points, and external dependencies

**Output Summary:**

- Detected system boundaries and major components
- Current documentation coverage and confidence level
- Known technology stack and infrastructure footprint
- Highlighted gaps or ambiguous areas needing clarification

### Step 3: CONTEXT-SUMMARY

Elicit architecture context to supplement artifact discoveries.

**Elicitation Areas:**

- Business capabilities and critical workflows the system must support
- Non-functional drivers (performance, security, compliance, availability)
- Deployment targets, scaling expectations, and operational constraints
- Integration landscape (internal services, third-party APIs, data stores)
- Timeline, resource limits, and appetite for change vs. documentation only

**Process:**

- Present artifact observations and open questions from Step 2
- Use advanced elicitation (1-9 menu) for each context area
- Capture clarifications, success metrics, and assumptions
- Log unresolved issues for follow-up

### Step 4: ARCHITECTURE-INVENTORY

Organize the discovered information into structured views.

**Actions:**

- Catalog components, services, and deployment units with ownership notes
- Map data flows, integration contracts, and external dependencies
- Summarize existing architectural decisions or ADRs
- Identify infrastructure layers (network, compute, storage, observability)
- Capture tooling, CI/CD, and runtime environment details

### Step 5: GAP-ANALYSIS

Identify missing, outdated, or conflicting architectural information.

**Actions:**

- Compare stakeholder goals with current architecture fitness
- Flag risks, bottlenecks, and constraints requiring attention
- Prioritize open questions or research items for follow-up
- Recommend focus areas for deeper dives or future epics

### Step 6: TEMPLATE-SELECTION

Choose the most appropriate architecture template(s) based on system scope.

**Actions:**

- Determine whether fullstack, backend, frontend, or generic architecture template best fits
- Load necessary template(s) listed in the command steps
- Pre-fill template metadata with `project_identifier`, artifact findings, and elicited context

### Step 7: CREATE-ARCHITECTURE-DOC

Invoke template-driven document creation with consolidated inputs.

**Actions:**

- Execute `create-doc.md` subtask with the selected architecture template
- Populate sections covering system context, component breakdown, data/integration flows, infrastructure, quality attributes, risks, and roadmap items
- Use elicitation to resolve remaining unknowns before finalizing sections
- Ensure diagrams or references are noted for later inclusion if tooling is external

### Step 8: HANDOFF

Provide completion summary and integration guidance.

**Handoff Contents:**

- Architecture document path and versioning details
- Summary of key architectural decisions, risks, and follow-up items
- Coverage assessment of artifacts analyzed and confidence levels
- Recommended next steps (e.g., run architect checklist, plan ADR updates, align with QA or dev planning)

## Integration Points

- **Architect Workflow:** Enables architecture updates, checklist execution, and ADR planning
- **Engineering Workflow:** Supplies reference architecture for implementation stories and spike planning
- **QA Workflow:** Feeds non-functional requirements and integration maps into test strategy
- **Operations Workflow:** Provides infrastructure topology for monitoring, capacity, and incident response planning

## Quality Criteria

- Artifact review and stakeholder elicitation both completed and documented
- Architecture template fully populated with traceable inputs
- Gaps, risks, and follow-up actions clearly enumerated
- Document ready for downstream consumption without additional formatting
- Handoff includes actionable next steps and references to supporting materials
