# Planning Workflow

This guide outlines the planning workflow essential to spec-driven development. Effective planning establishes the parameters and objectives for agent execution and will precede (almost) all implementation activity.

## Definitions

1. **Greenfield Projects:** Initiatives begun without existing codebases, infrastructure, or system dependencies. All technical decisions are made with minimal constraints.
2. **Brownfield Projects:** Developments layered atop or integrated with established systems. Solutions must interact with, extend, or modify existing code, architecture, and business processes.

## Scopes and Rationale

Planning is the entry point for (almost) all software development activities. Matt Maher has made an excellent [video](https://www.youtube.com/watch?v=dBWnH0YA6tg&list=LL), perfectly explains and demonstrates why comprehensive planning is necessary for predictable, reliable agent performance.

That said, in the context of AI-driven development, planning typically represents the most token-intensive phase. Accordingly, distinct planning methods and optimization strategies are employed at different context scopes to ensure efficiency.

### Greenfield Planning

Greenfield planning applies when building a new project from the ground up. With no prior constraints, all technical and architectural decisions are open; planning at this scope results in foundational documents like project specs, architectures, and initial epics that shape the system’s future direction.

### Brownfield Planning

**1) For projects with PRD and architecture docs**

Brownfield planning is required when extending or modifying an established codebase or infrastructure. All proposals must account for existing systems, legacy constraints, and compatibility; effects includes updated design documents, architectural notes, and a clear analysis of dependencies and impacts.

**2) For projects without PRD and architecture docs**

The process is mostly identical with existing high-level documents, but this time with specialized brownfield document structure as drop-in replacement, signaling to agents to make changes with cautions and respect legacy code

### Small Incremental Changes

This scope covers limited improvements or bug fixes that are tightly contained within the system. Only the most relevant planning artifacts—such as brief specs or local story updates — need to be revised, and changes should avoid ripple effects that require broad architectural or document updates.

### Unit Changes

For trivial or highly localized modifications — such as correcting a typo or resolving a one-line logic bug — we **strongly recommended** to either prompt the agent directly, utilize a free tier web-based AI chat tool, or make the correction manually. These approaches are the most efficient, as they bypass the need for high-level planning or broader documentation updates.

## Flow

### Project Brief (optional)

### PRD and Architecture

### UI/UX

### Flow Graph
