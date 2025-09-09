# Coding Preferences

Use this document to capture coding conventions only. Do not duplicate technology choices or platform constraints — those live in the Architecture documents.

## 1) Naming Conventions

| Element           | Convention       | Example              |
| ----------------- | ---------------- | -------------------- |
| Files             | kebab-case       | user-profile.service |
| Classes/Types     | PascalCase       | UserProfile          |
| Functions/Methods | camelCase        | getUserProfile       |
| Constants         | UPPER_SNAKE_CASE | MAX_RETRY_ATTEMPTS   |
| Env vars          | UPPER_SNAKE_CASE | API_BASE_URL         |

## 2) Files & Directories

-  Source roots and common module folders (e.g., `src/components`, `src/services`):
-  Public vs internal modules (what is exported from where):
-  Path aliases/barrels (e.g., `@app/*`) and when to use them:

## 3) Imports & Exports

-  Prefer named vs default exports (policy):
-  Import ordering (builtin → external → internal):
-  Relative vs absolute imports (policy and thresholds):

## 4) Error Handling

-  Approved patterns (exception vs result-type) and when:
-  Standard error shapes/codes (reference arch doc if defined):
-  Retry/timeout/circuit-breaker usage (reference arch doc if defined):

## 5) Logging

-  Logger usage (avoid `console.log`):
-  Log levels and guidance (info/warn/error only where meaningful):
-  Structured fields to include (e.g., requestId, userId) and redaction rules:

## 6) Testing Conventions

-  Test file naming/location (e.g., `*.spec.ts` next to source):
-  Minimum coverage target (%):
-  Mocking/stubbing guidance (what to mock and where):

## 7) Security & Privacy

-  Secrets: never commit; use env/config only (reference secret manager in arch doc):
-  PII: do not log/store unnecessarily; redact in logs:
-  Input validation: apply at trust boundaries (reference arch doc schemas):

## 8) Git & PR Process

-  Commit convention (e.g., Conventional Commits):
-  Branch naming scheme:
-  Required CI checks for merge:
-  PR checklist location (copy or link):

## 9) Code Review Checklist (paste into PR template if helpful)

-  [ ] Code follows naming and directory conventions
-  [ ] Public API surface is minimal and documented where needed
-  [ ] Errors use approved patterns; user-facing messages are appropriate
-  [ ] Logging is structured and redacted; no secrets/PII
-  [ ] Input validation at boundaries where required
-  [ ] Tests cover happy-path and edge cases; coverage target met
-  [ ] No unnecessary dependencies or duplication
-  [ ] Changes align with architecture decisions (link to section if relevant)

-  Primary language(s):
-  Runtime(s)/VM(s) and versions:
-  Target platforms (OS/CPU/Accel):
