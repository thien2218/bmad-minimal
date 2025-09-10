# Coding Standards

A living document that captures practical, enforceable conventions for writing, organizing, testing, and shipping code in this repository. Treat this as the single source of truth when it comes to coding standards for this specific project.

## Naming Conventions

<!-- Consistent names for variables, functions, classes, files and feature flags, etc. -->

<!-- Example table:
| Element           | Convention       | Example              |
| ----------------- | ---------------- | -------------------- |
| Files             | kebab-case       | user-profile.service |
| Classes/Types     | PascalCase       | UserProfile          |
| Functions/Methods | camelCase        | getUserProfile       |
| Constants         | UPPER_SNAKE_CASE | MAX_RETRY_ATTEMPTS   |
| Env vars          | UPPER_SNAKE_CASE | API_BASE_URL         |
-->

## Formatting & layout

<!-- Indentation, max line length, blank lines, file-level ordering (automate with a formatter when possible), etc. -->

<!-- Examples:
- Use two spaces for indentation throughout the codebase.
- Aim for ~100 characters per line to keep diffs readable.
- Order file content: imports → types/constants → implementation → exports.
- Let the formatter handle spacing and punctuation; avoid manual style debates.
-->

## Comments & documentation

<!-- When to write docstrings, inline comments vs self-documenting code, required README or API docs, etc. -->

<!-- Examples:
- Add a one‑sentence doc comment to exported functions and modules summarizing purpose and key parameters.
- Prefer clear identifiers over explanatory comments; add notes only for non‑obvious tradeoffs.
- Keep a short usage note near complex modules to speed onboarding.
-->

## Imports & Exports

<!-- Prefer named vs default exports (policy), import ordering (builtin → external → internal), relative vs absolute imports (policy and thresholds) -->

<!-- Examples:
- Prefer named exports to make module APIs explicit.
- Group imports as built‑in, third‑party, then internal; separate groups with a blank line.
- Use absolute paths (e.g., @app/...) for internal modules to avoid deep relative paths.
-->

## Error Handling

<!-- Preferred error/exception style, propagation vs handling at call sites, user-facing error messages, etc. -->

<!-- Examples:
- Use clear error categories/codes and raise them at boundaries; avoid returning null for error cases.
- Handle errors where context is available (CLI handlers, HTTP controllers); propagate otherwise.
- Provide user‑facing messages that are actionable and avoid leaking internals.
-->

## Logging & observability

<!-- Log levels, structured logs, correlation IDs and where to add metrics/alerts, etc. -->

<!-- Examples:
- Use structured logs with correlation or request IDs and minimal context.
- Log at info for normal milestones, warn for degradations, error for failures requiring action.
- Never log secrets or tokens; prefer references (IDs) over raw content.
-->

## Testing Conventions

<!-- Test types (unit/integration/e2e), naming, where tests live, minimum coverage expectations for new code, etc. -->

<!-- Examples:
- Co‑locate tests next to implementation files (e.g., foo.ts and foo.spec.ts).
- Target at least 80% coverage for new code; prioritize critical paths.
- Mock I/O boundaries (filesystem, network); avoid mocking business logic.
-->

## APIs & interfaces

<!-- Versioning, backwards-compatibility rules, contract-first vs implementation-first, public/external vs internal APIs, etc. -->

<!-- Examples:
- Version REST endpoints (e.g., /v1/...) and avoid breaking changes within a major version.
- For GraphQL, evolve schemas add‑only and deprecate fields before removal.
- Keep public interfaces stable; document any breaking change with migration notes.
-->

## Git & PR Process

<!-- Commit convention (e.g., Conventional Commits), branch naming scheme, required CI checks for merge, etc. -->

<!-- Examples:
- Use Conventional Commits (feat:, fix:, chore:) for consistent history.
- Branch names reflect intent (e.g., feat/user‑profile‑edit).
- PRs must pass lint, tests, and type checks; link related issues and architecture decisions.
-->

## CI / build / release

<!-- Required CI checks, build reproducibility, artifact naming, release note policy, etc. -->

<!-- Examples:
- CI runs lint → unit tests → type checks; fail fast and keep logs actionable.
- Builds are reproducible; artifacts include name, version, and short commit SHA.
- Releases include a summary of features, fixes, and any breaking changes.
-->

# Refactoring and optimizations

<!-- When to optimize and/or refactor, separation of concerns, design patterns, code smells, etc. -->

<!-- Examples:
- Refactor when code becomes hard to read, reuse, or test; keep changes small and focused.
- Prefer composition and clear interfaces over inheritance and shared mutable state.
- Optimize only when measurements show a bottleneck; record before/after metrics.
-->

## Other Conventions

<!-- List out some other coding conventions that you might see fit for your project. -->
