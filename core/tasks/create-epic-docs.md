<!-- Powered by BMAD™ Core -->

# generate-epic-docs

Generate documentation for a completed epic after its status is set to `Done`. Supports multiple documentation methods with sensible fallbacks.

## Purpose

- Produce developer- or user-facing documentation artifacts for a completed epic
- Allow user to choose documentation method; if unspecified, pick fallbacks:
  - Backend → Swagger/OpenAPI
  - Frontend → Storybook
- Prioritize using the framework/library’s standard documentation approach and official integrations (e.g., built-in OpenAPI generators, Storybook presets/addons, CLI scaffolds) before custom scripts.

## Inputs

```yaml
required:
  - epic_id: "{epic}"                 # e.g., "2"
  - epic_path: "{epicRoot}/{epic}*.md"  # path to epic file (derived from config or docs directory)
optional:
  - method: one of ["swagger", "openapi", "storybook", "markdown", "mkdocs", "docusaurus", "mdbook", "custom"]
  - output_dir: custom output root for docs (default: docs/epics/{epic})
```

## Preconditions

- Epic status must be `Done`. If not, HALT and ask user to confirm or set to `Done`.
- Repository builds and tests should pass.

## Method Selection (elicit=true)

- If `method` is not provided, ask the user to choose one of the following (numbered list):
  1) Swagger/OpenAPI (backend API docs)
  2) Storybook (frontend component docs)
  3) Markdown (README and usage guides)
  4) MkDocs (static site)
  5) Docusaurus (static site)
  6) mdBook (book-style)
  7) Custom (user provides command)
- If user does not choose after prompt, determine fallback based on epic scope:
  - If epic primarily changed backend/service code → use Swagger/OpenAPI
  - If epic primarily changed UI/frontend code → use Storybook
  - Otherwise → use Markdown

Heuristics to infer scope (best-effort; ask if ambiguous):
- Backend indicators: presence of `src/services`, `src/api`, `openapi.*.(yaml|yml|json)`, server frameworks in deps
- Frontend indicators: presence of `package.json` with React/Vue/Svelte, `src/components`, `.storybook/`

## Outputs

- Generated documentation artifacts under `{output_dir}` (default: `docs/epics/{epic}`):
  - Swagger/OpenAPI: `openapi.json` or `openapi.yaml` + rendered HTML if generator available
  - Storybook: static build (e.g., `storybook-static/`) copied or linked under `{output_dir}/storybook`
  - Markdown: `README.md`, `CHANGELOG.md`, and feature usage notes
  - MkDocs/Docusaurus/mdBook: site content generated to subfolder
- Update the epic file’s "Change Log" or equivalent documentation section only if permitted by rules; otherwise list generated paths in Dev Agent Record of the controlling story.

## Process (Do not skip steps)

### 0) Load Core Config
- Read core config to resolve default doc directories if present (e.g., `docs/` root).

### 1) Locate Epic and Validate Status
- Resolve `epic_path` and open the epic file.
- Confirm epic `Status: Done`. If not `Done`, HALT and ask user to proceed only after completion.

### 2) Determine Method
- If `method` provided, use it.
- Else elicit choice as described above.
- Else apply fallback rules.

### 3) Prepare Output Directory
- Set `output_dir = docs/epics/{epic}` if not provided.
- Ensure the directory exists (create if necessary).

### 4) Generate Documentation (by method, prioritizing official tooling)

- Swagger/OpenAPI:
  - Prefer the framework/library’s built-in or official OpenAPI generation (e.g., framework CLI or plugin) before custom scripts. Check the integration documentation through web search or MCP if provded.
  - If `openapi.yaml/json` exists, validate and copy to `{output_dir}`.
  - If annotations/code can generate OpenAPI via a standard script (e.g., `npm run openapi:gen`, `pnpm openapi:gen`, `deno task openapi`), run it and write results to `{output_dir}`.
  - If neither exists, scaffold `openapi.yaml` with tags and paths inferred from the epic’s stories and commit as a starting point.

- Storybook:
  - Prefer official Storybook builder and presets (e.g., `@storybook/*` packages) for the framework in use.
  - If `.storybook/` exists, run static build (e.g., `npm run build-storybook` or `pnpm build-storybook`).
  - Copy or symlink the output (commonly `storybook-static/`) into `{output_dir}/storybook`.
  - If Storybook isn’t configured, scaffold a minimal, framework-appropriate setup and note follow-up actions.

- Markdown:
  - Create `{output_dir}/README.md` summarizing the epic: scope, modules changed, usage examples, and acceptance criteria mapping.
  - If applicable, create `{output_dir}/CHANGELOG.md` capturing user-visible changes.

- MkDocs/Docusaurus/mdBook:
  - If project already uses one, invoke the standard build command and publish under `{output_dir}`.
  - If not configured, scaffold minimal content pages under `{output_dir}/site` and record next steps.

- Custom:
  - Prompt user for the exact command(s) to run and any templates/paths to use. Execute and record outputs to `{output_dir}`.

### 5) Validation
- Ensure artifacts exist in `{output_dir}` and include at least one top-level index (README.md or site index.html).
- If generation fails, report errors and request user input for missing tools or scripts.

### 6) Recordkeeping
- If allowed, update the Dev Agent Record in the relevant controlling story with:
  - Debug Log references (commands and results)
  - Completion Notes (method used, files generated)
  - File List of created/modified paths
  - Change Log entry
- Do not modify disallowed sections.

## Blocking Conditions
- Epic file not found or status not `Done`.
- Required generation tools/scripts missing and user declines scaffolding.
- Output directory cannot be written.

## Completion Checklist
- Artifacts created under `{output_dir}` with an entry point.
- Method selection recorded.
- Dev Agent Record updated where allowed.
- No validation errors remain.

