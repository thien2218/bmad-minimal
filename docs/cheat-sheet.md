## dev – Full Stack Developer

Expert who implements stories by reading requirements and executing tasks sequentially with comprehensive testing. Minimize context overhead.

### Commands

- `help`: Show numbered list of available commands

- `switch-agent`: Switch to a different supported agent persona. If no agent parameter is provided, list available agents and request selection. If an unsupported agent is provided, show the available list and prompt again.
  - optional: agent

- `explain`: Explain recent actions and rationale as if you are training a junior engineer

- `develop-story`: Execute develop-story (implementation-first flow; write tests at the end during validation) on the highest ordered story ready for development or the story specified by the user
  - required: story
  - optional: test_command, build_command, lint_command

- `develop-story-test-first`: Execute develop-story with a test-first flow (TDD approach): implement test cases from the story's Test Specs section first, then implement the feature until tests pass.
  - required: story
  - optional: test_command, build_command, lint_command

- `apply-qa-fixes`: Apply code/test fixes based on QA outputs (gate + assessments) for a specified story.
  - required: story
  - optional: test_command, lint_command

- `update-project-docs`: Update or create project documentation (API docs via Swagger/OpenAPI for backend, component docs via Storybook for frontend) with an in-place-first philosophy.
  - optional: type, method

---

## pdm – Product Development Master

Use for epic management, backlog prioritization, sprint planning, and orchestrating story creation/execution.

### Commands

- `help`: Show numbered list of available commands

- `switch-agent`: Switch to a different supported agent persona. If no agent parameter is provided, list available agents and request selection. If an unsupported agent is provided, show the available list and prompt again.
  - optional: agent

- `correct-course`: Execute task correct-course.yaml
  - required: change_trigger, initial_impact
  - optional: interaction_mode

- `yolo`: Toggle YOLO Mode (when ON will skip doc section confirmations)

- `create-epic`: Create the next highest order epic for project
  - required: epic_number, enhancement_name

- `create-epics`: Create epics from PRD epic list

- `create-story`: Create the next story for the highest ordered epic or the one specified by user.
  - required: epic

- `create-stories`: Create all stories for the highest ordered epic or targeted epic
  - required: epic

- `create-adhoc-epic`: Create the next highest order adhoc epic
  - required: change_description
  - optional: epic_adhoc_number

- `create-adhoc-story`: Create next adhoc story for highest order or targeted adhoc epic
  - required: adhoc_epic
  - optional: adhoc_number

- `create-adhoc-stories`: Create all adhoc stories for the highest ordered adhoc epic or targeted adhoc epic
  - required: adhoc_epic

- `create-standalone-story`: Create a single standalone story for very small enhancements that can be completed in one focused development session
  - required: change_description
  - optional: enhancement_number

---

## qa – Test Architect & Quality Advisor

Test architect who provides thorough quality assessment and actionable recommendations without blocking progress.

### Commands

- `help`: Show numbered list of available commands

- `switch-agent`: Switch to a different supported agent persona. If no agent parameter is provided, list available agents and request selection. If an unsupported agent is provided, show the available list and prompt again.
  - optional: agent

- `review`: Adaptive, risk-aware comprehensive review. Produces QA Results update in story file + gate file.
  - required: story
  - optional: architecture_refs, coding_standards

- `spec-outline-review`: Review a plain-English outline of test cases for clarity, coverage, and traceability (optional story), and produce an actionable improvement report.
  - required: outline, story

- `test-design`: Execute test-design task to create comprehensive test scenarios
  - required: story

- `nfr-assess`: Execute nfr-assess task to assess non-functional requirements (security, code-level performance, reliability, maintainability) for a story
  - required: story
  - optional: architecture_refs, coding_standards, interaction_mode

---

## analyst – Research & Strategy Analyst

Analyst specialized in scope triage, research framing, and planning artifacts

### Commands

- `help`: Show numbered list of available commands

- `switch-agent`: Switch to a different supported agent persona. If no agent parameter is provided, list available agents and request selection. If an unsupported agent is provided, show the available list and prompt again.
  - optional: agent

- `analyze-planning-scope`: Analyze a proposed change or implementation and recommend an appropriate planning scope level

- `create-prd`: Create PRD

- `update-prd`: Update an existing PRD based on user's change request (add feature, extend functionality, change of library, etc.).
  - required: change_request

- `document-project`: Analyze existing project artifacts and create comprehensive PRD using template-driven process

- `brainstorm-requirements`: Facilitate an interactive brainstorming session and capture output using the brainstorming template

- `create-deep-research-prompt`: Create a deep research prompt focused on project idea exploration, user understanding, or technical feasibility discovery

- `create-project-brief`: Create project brief using the template-driven document creation task

- `doc-out`: Output full document to current destination file

---

## architect – System Architect

Master of holistic application design bridging frontend, backend, and infrastructure

### Commands

- `help`: Show numbered list of available commands

- `switch-agent`: Switch to a different supported agent persona. If no agent parameter is provided, list available agents and request selection. If an unsupported agent is provided, show the available list and prompt again.
  - optional: agent

- `create-app-architecture`: Create app architecture document

- `create-fullstack-architecture`: Create fullstack architecture document

- `create-backend-architecture`: Create backend architecture document

- `create-frontend-architecture`: Create frontend architecture document

- `document-project`: Document the architecture of an existing project. Use one or multiple templates depending on the type of project

- `execute-checklist`: Run checklist
  - required: checklist

- `update-architecture`: Update an existing architecture document based on user's change request (add feature, extend functionality, change of library, etc.).
  - required: doc_type, change_request

- `document-out`: Output full document in markdown format to current destination file

---

## ux-expert – UX Expert

UX Expert specializing in user experience design and creating intuitive interfaces

### Commands

- `help`: Show numbered list of available commands

- `switch-agent`: Switch to a different supported agent persona. If no agent parameter is provided, list available agents and request selection. If an unsupported agent is provided, show the available list and prompt again.
  - optional: agent

- `create-frontend-spec`: Create frontend specification document

- `generate-ui-prompt`: Generate AI UI prompt

- `exit`: Exit UX Expert persona
