# Technical Preferences

A living document that captures product-wide technical decisions, defaults, and constraints. Use this to align teams and accelerate delivery.

<!-- Guidance: Keep Required sections short and practical. Use simple, concrete choices. Optional sections can be filled later or linked to ADRs/RFCs. Remove or adapt comments after completing a section. -->

---

## How to use this document

-  Start with Required sections only. You can ship with just these.
-  Prefer defaults and LTS versions. Add links to ADRs/RFCs for anything non-default.
-  Mark unknowns as "TBD" with an owner and a date.
-  Review cadence: <!-- e.g., quarterly; add a calendar reminder -->

---

## Basic information (fill these first)

### R1) Frameworks and libraries

<!-- List only what you will use now. Add more later via ADRs. -->

-  Language(s): <!-- e.g., TypeScript 5.x -->
-  Frontend: <!-- e.g., React 18, Next.js 14, UI kit -->
-  Backend: <!-- e.g., Fastify/Express/NestJS; ORM (Prisma) -->
-  Testing: <!-- e.g., Vitest/Jest; E2E: Playwright/Cypress -->
-  Build tools: <!-- e.g., Vite, SWC/esbuild -->

---

### R2) Project structure and package management

<!-- Standardize repo shape and package manager. -->

-  Repo model: <!-- monorepo or polyrepo -->
-  Directory layout (high-level): <!-- e.g., apps/, packages/, infra/, docs/ -->
-  Package manager & version: <!-- pnpm|npm|yarn and version -->
-  Workspaces: <!-- yes/no; how to add a new package -->

---

### R3) Code quality

<!-- Make code readable and consistent. -->

-  Formatting: <!-- Prettier/Black/gofmt; config link -->
-  Linting: <!-- ESLint/flake8/golangci-lint; rule set -->
-  Commit convention: <!-- e.g., Conventional Commits -->

---

### R4) API style and versioning

<!-- Pick one: REST, GraphQL, gRPC, or hybrid. -->

-  Style: <!-- e.g., REST -->
-  Versioning: <!-- e.g., URL-based /v1; or GraphQL schema versioning -->
-  Error model: <!-- e.g., HTTP problem+json; standard error codes -->

---

### R5) Data and storage

<!-- Choose one primary database and a migration tool. -->

-  Primary database: <!-- e.g., PostgreSQL 15 -->
-  ORM/Query layer: <!-- e.g., Prisma; policy on raw SQL -->
-  Migrations: <!-- tool and where migration files live -->

---

### R6) High-level infrastructure and environments

<!-- Define where it runs and how secrets/config are handled. -->

-  Cloud/provider(s): <!-- e.g., AWS us-east-1 -->
-  Environments: <!-- dev, staging, prod; parity expectations -->
-  Secrets management: <!-- e.g., AWS Secrets Manager/Vault; no secrets in code -->

---

### R7) Security

<!-- Baseline controls to avoid surprises. Keep it practical. -->

-  AuthN/AuthZ approach: <!-- e.g., OIDC via Auth0; RBAC roles: admin, user -->
-  Secrets policy: <!-- where stored, rotation cadence -->
-  Dependency updates: <!-- Renovate/Dependabot policy -->

---

### R8) Observability

<!-- Enough to debug production issues. -->

-  Logging: <!-- JSON logs; correlation/request IDs -->
-  Metrics: <!-- tool and key app metrics -->
-  Error tracking: <!-- tool (e.g., Sentry) and ownership -->

---

### R9) Testing strategy

<!-- Pyramid overview; define gates. -->

-  Unit tests: <!-- framework; coverage target (e.g., 80%) -->
-  Integration/E2E: <!-- tools and environment -->
-  Quality gates: <!-- required to merge/deploy -->

---

## Advanced information

### O1) API design

<!-- Conventions for naming, pagination, filtering, and rate limits. -->

-  Naming and resource modeling: <!-- plural nouns, camelCase vs snake_case -->
-  Pagination/filtering/sorting: <!-- cursor vs offset; param names -->
-  Idempotency & retries: <!-- idempotency keys for POST; retry policies -->
-  Rate limiting & quotas: <!-- limits and headers -->
-  Documentation: <!-- OpenAPI/Swagger; GraphQL SDL; publishing -->

---

### O2) Caching strategy

-  Layers: <!-- CDN, edge, app cache, DB cache -->
-  TTL defaults: <!-- per resource/type -->
-  Invalidation rules: <!-- write-through, explicit busting -->
-  Consistency & fallbacks: <!-- stale-while-revalidate, circuit breakers -->

---

### O3) Messaging and asynchronous processing

-  Technology: <!-- Kafka/RabbitMQ/SQS/Pub/Sub -->
-  Delivery semantics: <!-- at-least-once, effective exactly-once; ordering -->
-  Retry and DLQ policy: <!-- backoff, max attempts, alerting -->
-  Event schema governance: <!-- versioning, schema registry -->

---

### O4) Performance and scalability

-  Performance budgets: <!-- p95 latency, memory, LCP -->
-  Load & stress testing: <!-- tools, scenarios, thresholds -->
-  Capacity planning: <!-- initial sizing, autoscaling policy -->
-  Backpressure & rate limiting: <!-- defaults and overrides -->

---

### O5) Data management

-  Secondary stores: <!-- Redis, S3/object storage, Elasticsearch, Snowflake -->
-  Schema conventions: <!-- naming, surrogate keys, timestamps, soft deletes -->
-  Retention & archival: <!-- per table/dataset policies -->
-  Backup & restore: <!-- frequency, encryption, test-restore cadence -->

---

### O6) Low-level infrastructure

-  Compute/orchestration: <!-- containers, serverless, Kubernetes -->
-  Networking: <!-- VPC, ingress/egress, private links -->
-  IaC: <!-- Terraform/Pulumi; state storage; module registry; review gates -->
-  Environments: <!-- ephemeral PR envs; parity -->
-  Configuration precedence: <!-- code < defaults < env < secrets -->

---

### O7) Observability

-  Tracing: <!-- OpenTelemetry; sampling rates; propagation -->
-  Dashboards: <!-- standard dashboards; ownership -->
-  Alerts & runbooks: <!-- alert sources, links, paging policy -->
-  SLOs/SLIs: <!-- targets, error budgets, review cadence -->

---

### O8) Feature flags and runtime configuration

-  Tooling: <!-- LaunchDarkly/ConfigCat/internal -->
-  Flag taxonomy: <!-- release, ops, experiment -->
-  Defaults & kill-switches: <!-- behavior when flag service is down -->
-  Cleanup policy: <!-- deprecate/remove stale flags -->

---

### O9) Internationalization (i18n) and Accessibility (a11y)

-  Supported locales: <!-- initial and target list -->
-  i18n framework: <!-- e.g., i18next, react-intl -->
-  Localization workflow: <!-- translation tool/vendor, QA -->
-  Accessibility target: <!-- e.g., WCAG 2.1 AA; testing tools -->

---

### O10) UX/UI and design system

-  Design system: <!-- name, source of truth, component library -->
-  Theming & tokens: <!-- light/dark modes, density, motion -->
-  Interaction patterns: <!-- navigation, forms, validation -->

---

### O11) Documentation

-  Developer docs: <!-- where they live, structure -->
-  API docs: <!-- auto-generated? where published? -->
-  ADRs: <!-- location and process -->
-  Diagrams: <!-- C4/PlantUML/Mermaid and storage -->

---

### O12) Third-party services and integrations

-  Providers & purpose: <!-- Auth0, Stripe, etc. -->
-  Data flows: <!-- what data is shared; PII classification -->
-  Credentials & scopes: <!-- least privilege, rotation -->
-  Sandbox vs prod: <!-- environments and switching -->
-  Failure strategy: <!-- graceful degradation, retries, fallbacks -->

---

### O13) Privacy and analytics

-  Event schema: <!-- analytics taxonomy; owners -->
-  PII/consent: <!-- cookie/GDPR consent; do-not-track -->
-  Data retention: <!-- storage duration per event/type -->
-  Analytics tools: <!-- Segment, GA4, Amplitude -->

---

### O14) Backups and disaster recovery

-  RTO/RPO targets: <!-- define per system -->
-  Backup schedule: <!-- frequency and scope -->
-  Restore testing: <!-- cadence and ownership -->
-  DR strategy: <!-- warm standby/active-active; failover procedure -->

---

### O15) Open source and licensing

-  Product license: <!-- proprietary, MIT, Apache-2.0 -->
-  Third-party license policy: <!-- allowed/disallowed; scanning tool -->
-  Contribution policy: <!-- outbound contributions, upstreaming -->

---

### O16) Cost management (FinOps)

-  Budgets: <!-- per env/team/service -->
-  Tagging & chargeback: <!-- required tags and reports -->
-  Cost monitoring: <!-- tools and alert thresholds -->

---

### O17) Glossary and references

-  Glossary: <!-- define key terms to avoid ambiguity -->
-  References: <!-- link to canonical docs/resources -->

---

### O18) Platform and support matrix

<!-- Define minimum supported platforms and browsers. -->

-  Operating systems: <!-- servers/dev OS baselines -->
-  Mobile (if applicable): <!-- iOS/Android versions or N/A -->

| Surface | Min version(s)                                        | Notes                       |
| ------- | ----------------------------------------------------- | --------------------------- |
| Web     | <!-- Chrome 114, Firefox 115, Safari 16, Edge 114 --> | <!-- ESR where possible --> |
| Mobile  | <!-- iOS 16, Android 11 -->                           | <!-- if applicable -->      |

---

### O19) Release and rollback

<!-- How we ship and how we recover. -->

-  Versioning scheme: <!-- semver/calver -->
-  Release cadence: <!-- e.g., weekly -->
-  Rollback policy: <!-- triggers, mechanism, owner -->

---

### O20) CI/CD

<!-- Identify CI system and required checks. -->

-  CI system: <!-- e.g., GitHub Actions -->
-  Required checks: <!-- lint, typecheck, unit tests, build, security scan -->
-  Deployment strategy: <!-- e.g., rolling; manual approval for prod -->

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

-  Canary: <!-- daily, auto-deploy to canary env -->
-  Beta: <!-- weekly, opt-in customers -->
-  Stable: <!-- bi-weekly to prod; rollback within 30 min on SLO breach -->
