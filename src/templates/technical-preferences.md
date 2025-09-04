# Technical Preferences

A living document that captures product-wide technical decisions, defaults, and constraints. Use this to align teams and accelerate delivery.

<!-- Guidance: Keep Required sections short and practical. Use simple, concrete choices. Optional sections can be filled later or linked to ADRs/RFCs. Remove or adapt comments after completing a section. -->

---

## How to use this document

-  Start with Required sections only. You can ship with just these.
-  Prefer defaults and LTS versions. Add links to ADRs/RFCs for anything non-default.
-  Mark unknowns as "TBD" with an owner and a date.
-  Review cadence: TBD <!-- e.g., quarterly; add a calendar reminder -->

---

## Basic information (fill these first)

### R1) Frameworks and libraries

<!-- List only what you will use now. Add more later via ADRs. -->

-  Language(s): TBD <!-- e.g., TypeScript 5.x -->
-  Frontend: TBD <!-- e.g., React 18, Next.js 14, UI kit -->
-  Backend: TBD <!-- e.g., Fastify/Express/NestJS; ORM (Prisma) -->
-  Testing: TBD <!-- e.g., Vitest/Jest; E2E: Playwright/Cypress -->
-  Build tools: TBD <!-- e.g., Vite, SWC/esbuild -->

---

### R2) Project structure and package management

<!-- Standardize repo shape and package manager. -->

-  Repo model: TBD <!-- monorepo or polyrepo -->
-  Directory layout (high-level): TBD <!-- e.g., apps/, packages/, infra/, docs/ -->
-  Package manager & version: TBD <!-- pnpm|npm|yarn and version -->
-  Workspaces: TBD <!-- yes/no; how to add a new package -->

---

### R3) Code quality

<!-- Make code readable and consistent. -->

-  Formatting: TBD <!-- Prettier/Black/gofmt; config link -->
-  Linting: TBD <!-- ESLint/flake8/golangci-lint; rule set -->
-  Commit convention: TBD <!-- e.g., Conventional Commits -->

---

### R4) API style and versioning

<!-- Pick one: REST, GraphQL, gRPC, or hybrid. -->

-  Style: TBD <!-- e.g., REST -->
-  Versioning: TBD <!-- e.g., URL-based /v1; or GraphQL schema versioning -->
-  Error model: TBD <!-- e.g., HTTP problem+json; standard error codes -->

---

### R5) Data and storage

<!-- Choose one primary database and a migration tool. -->

-  Primary database: TBD <!-- e.g., PostgreSQL 15 -->
-  ORM/Query layer: TBD <!-- e.g., Prisma; policy on raw SQL -->
-  Migrations: TBD <!-- tool and where migration files live -->

---

### R6) High-level infrastructure and environments

<!-- Define where it runs and how secrets/config are handled. -->

-  Cloud/provider(s): TBD <!-- e.g., AWS us-east-1 -->
-  Environments: TBD <!-- dev, staging, prod; parity expectations -->
-  Secrets management: TBD <!-- e.g., AWS Secrets Manager/Vault; no secrets in code -->

---

### R7) Security

<!-- Baseline controls to avoid surprises. Keep it practical. -->

-  AuthN/AuthZ approach: TBD <!-- e.g., OIDC via Auth0; RBAC roles: admin, user -->
-  Secrets policy: TBD <!-- where stored, rotation cadence -->
-  Dependency updates: TBD <!-- Renovate/Dependabot policy -->

---

### R8) Observability

<!-- Enough to debug production issues. -->

-  Logging: TBD <!-- JSON logs; correlation/request IDs -->
-  Metrics: TBD <!-- tool and key app metrics -->
-  Error tracking: TBD <!-- tool (e.g., Sentry) and ownership -->

---

### R9) Testing strategy

<!-- Pyramid overview; define gates. -->

-  Unit tests: TBD <!-- framework; coverage target (e.g., 80%) -->
-  Integration/E2E: TBD <!-- tools and environment -->
-  Quality gates: TBD <!-- required to merge/deploy -->

---

## Advanced information

### O1) API design

<!-- Conventions for naming, pagination, filtering, and rate limits. -->

-  Naming and resource modeling: TBD <!-- plural nouns, camelCase vs snake_case -->
-  Pagination/filtering/sorting: TBD <!-- cursor vs offset; param names -->
-  Idempotency & retries: TBD <!-- idempotency keys for POST; retry policies -->
-  Rate limiting & quotas: TBD <!-- limits and headers -->
-  Documentation: TBD <!-- OpenAPI/Swagger; GraphQL SDL; publishing -->

---

### O2) Caching strategy

-  Layers: TBD <!-- CDN, edge, app cache, DB cache -->
-  TTL defaults: TBD <!-- per resource/type -->
-  Invalidation rules: TBD <!-- write-through, explicit busting -->
-  Consistency & fallbacks: TBD <!-- stale-while-revalidate, circuit breakers -->

---

### O3) Messaging and asynchronous processing

-  Technology: TBD <!-- Kafka/RabbitMQ/SQS/Pub/Sub -->
-  Delivery semantics: TBD <!-- at-least-once, effective exactly-once; ordering -->
-  Retry and DLQ policy: TBD <!-- backoff, max attempts, alerting -->
-  Event schema governance: TBD <!-- versioning, schema registry -->

---

### O4) Performance and scalability

-  Performance budgets: TBD <!-- p95 latency, memory, LCP -->
-  Load & stress testing: TBD <!-- tools, scenarios, thresholds -->
-  Capacity planning: TBD <!-- initial sizing, autoscaling policy -->
-  Backpressure & rate limiting: TBD <!-- defaults and overrides -->

---

### O5) Data management

-  Secondary stores: TBD <!-- Redis, S3/object storage, Elasticsearch, Snowflake -->
-  Schema conventions: TBD <!-- naming, surrogate keys, timestamps, soft deletes -->
-  Retention & archival: TBD <!-- per table/dataset policies -->
-  Backup & restore: TBD <!-- frequency, encryption, test-restore cadence -->

---

### O6) Low-level infrastructure

-  Compute/orchestration: TBD <!-- containers, serverless, Kubernetes -->
-  Networking: TBD <!-- VPC, ingress/egress, private links -->
-  IaC: TBD <!-- Terraform/Pulumi; state storage; module registry; review gates -->
-  Environments: TBD <!-- ephemeral PR envs; parity -->
-  Configuration precedence: TBD <!-- code < defaults < env < secrets -->

---

### O7) Observability

-  Tracing: TBD <!-- OpenTelemetry; sampling rates; propagation -->
-  Dashboards: TBD <!-- standard dashboards; ownership -->
-  Alerts & runbooks: TBD <!-- alert sources, links, paging policy -->
-  SLOs/SLIs: TBD <!-- targets, error budgets, review cadence -->

---

### O8) Feature flags and runtime configuration

-  Tooling: TBD <!-- LaunchDarkly/ConfigCat/internal -->
-  Flag taxonomy: TBD <!-- release, ops, experiment -->
-  Defaults & kill-switches: TBD <!-- behavior when flag service is down -->
-  Cleanup policy: TBD <!-- deprecate/remove stale flags -->

---

### O9) Internationalization (i18n) and Accessibility (a11y)

-  Supported locales: TBD <!-- initial and target list -->
-  i18n framework: TBD <!-- e.g., i18next, react-intl -->
-  Localization workflow: TBD <!-- translation tool/vendor, QA -->
-  Accessibility target: TBD <!-- e.g., WCAG 2.1 AA; testing tools -->

---

### O10) UX/UI and design system

-  Design system: TBD <!-- name, source of truth, component library -->
-  Theming & tokens: TBD <!-- light/dark modes, density, motion -->
-  Interaction patterns: TBD <!-- navigation, forms, validation -->

---

### O11) Documentation

-  Developer docs: TBD <!-- where they live, structure -->
-  API docs: TBD <!-- auto-generated? where published? -->
-  ADRs: TBD <!-- location and process -->
-  Diagrams: TBD <!-- C4/PlantUML/Mermaid and storage -->

---

### O12) Third-party services and integrations

-  Providers & purpose: TBD <!-- Auth0, Stripe, etc. -->
-  Data flows: TBD <!-- what data is shared; PII classification -->
-  Credentials & scopes: TBD <!-- least privilege, rotation -->
-  Sandbox vs prod: TBD <!-- environments and switching -->
-  Failure strategy: TBD <!-- graceful degradation, retries, fallbacks -->

---

### O13) Privacy and analytics

-  Event schema: TBD <!-- analytics taxonomy; owners -->
-  PII/consent: TBD <!-- cookie/GDPR consent; do-not-track -->
-  Data retention: TBD <!-- storage duration per event/type -->
-  Analytics tools: TBD <!-- Segment, GA4, Amplitude -->

---

### O14) Backups and disaster recovery

-  RTO/RPO targets: TBD <!-- define per system -->
-  Backup schedule: TBD <!-- frequency and scope -->
-  Restore testing: TBD <!-- cadence and ownership -->
-  DR strategy: TBD <!-- warm standby/active-active; failover procedure -->

---

### O15) Open source and licensing

-  Product license: TBD <!-- proprietary, MIT, Apache-2.0 -->
-  Third-party license policy: TBD <!-- allowed/disallowed; scanning tool -->
-  Contribution policy: TBD <!-- outbound contributions, upstreaming -->

---

### O16) Cost management (FinOps)

-  Budgets: TBD <!-- per env/team/service -->
-  Tagging & chargeback: TBD <!-- required tags and reports -->
-  Cost monitoring: TBD <!-- tools and alert thresholds -->

---

### O17) Glossary and references

-  Glossary: TBD <!-- define key terms to avoid ambiguity -->
-  References: TBD <!-- link to canonical docs/resources -->

---

### O18) Platform and support matrix

<!-- Define minimum supported platforms and browsers. -->

-  Operating systems: TBD <!-- servers/dev OS baselines -->
-  Mobile (if applicable): TBD <!-- iOS/Android versions or N/A -->

| Surface | Min version(s)                                        | Notes                       |
| ------- | ----------------------------------------------------- | --------------------------- |
| Web     | <!-- Chrome 114, Firefox 115, Safari 16, Edge 114 --> | <!-- ESR where possible --> |
| Mobile  | <!-- iOS 16, Android 11 -->                           | <!-- if applicable -->      |

---

### O19) Release and rollback

<!-- How we ship and how we recover. -->

-  Versioning scheme: TBD <!-- semver/calver -->
-  Release cadence: TBD <!-- e.g., weekly -->
-  Rollback policy: TBD <!-- triggers, mechanism, owner -->

---

### O20) CI/CD

<!-- Identify CI system and required checks. -->

-  CI system: TBD <!-- e.g., GitHub Actions -->
-  Required checks: TBD <!-- lint, typecheck, unit tests, build, security scan -->
-  Deployment strategy: TBD <!-- e.g., rolling; manual approval for prod -->

---

### Appendix A: Example matrices (optional)

Browser support (example):

| Browser | Min version | Notes                 |
| ------- | ----------- | --------------------- |
| Chrome  | 114         | LTS desktop + Android |
| Firefox | 115         | ESR where possible    |
| Safari  | 16          | iOS/iPadOS aligned    |
| Edge    | 114         | Chromium-based        |

Release channels (example):

-  Canary: TBD <!-- daily, auto-deploy to canary env -->
-  Beta: TBD <!-- weekly, opt-in customers -->
-  Stable: TBD <!-- bi-weekly to prod; rollback within 30 min on SLO breach -->
