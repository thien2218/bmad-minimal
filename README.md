# BMAD Minimal

A lightweight, developer-centric implementation of the [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD), designed solely for software development workflow. This package aims to improve on a couple of aspects of the OG BMAD Method and delivers them as our core philosophy:

-  **Context efficiency**: Keeps related logic and files closely coupled, reducing the overhead of context switching.
-  **Developer-focused**: An intuitive design and guids are prioritized for a seamless DX.
-  **Flexibility**: The workflows are designed to adapt to different project scales and architectures.
-  **Simplified workflows**: Reduces boilerplate and streamlines common tasks so you can get productive in minutes.

> _"Foundations in Agentic Agile Driven Development, known as the Breakthrough Method of Agile AI-Driven Development, yet so much more. Transform any domain with specialized AI expertise: software development, entertainment, creative writing, business strategy to personal wellness just to name a few."_

If you find this project helpful, consider giving it a ⭐ to support us!

## Quick Navigation

### Core Guides & Worflows

0. [Quick Start](README.md#quick-start) -> Your essential guide to installing and running the project on your local machine.
1. [Cheat Sheet](docs/cheat-sheet.md) -> Rapid reference covering core commands, agent roles, workflow triggers, and configuration shortcuts so you can orient yourself in seconds without using `*help` commands.
2. [Planning Workflow](docs/planning-workflow.md) -> The interactive spec-driven planning flow to produce high level documents and stories with planning agents.
3. [IDE Development Workflow](docs/ide-development-workflow.md) -> The detailed how-to for your day-to-day project development flow in your favorite IDE with engineering agents.

### What would you like to do?

-  See [default configurations](core/config.json) setup.
-  See available [planning agents](core/engineering/agents).
-  See available [engineering agents](core/planning/agents).

## Overview

Using the latest spec-driven workflows of the BMAD Method as the central foundation of our work, we expand around it with our own set of improvements:

1. **Agentic Planning (Web-based)**: Planning agents are bundled minimally and sessions are context-specific, ensuring practical workflows that remain within the free tier of popular AI providers.
2. **Context-Efficient IDE Development**: Development tasks use LLM-friendly formats and have clearly defined scopes, reducing token consumption, repetition, and unnecessary context switching.
3. **Brownfield Development**: Comprehensive guides support flexible project adaptation, making it straightforward to opt in or out of features or extend your project beyond the original plan.

The unified approach behind BMAD Minimal emphasizes clarity and flexibility, enabling teams to focus on meaningful work without unnecessary overhead. By distilling workflows to their essential components and supporting adaptable project evolution, this methodology ensures that both new and existing projects maintain consistent quality and momentum.

## Philosophy & Principles

### Efficiency above ALL

LLMs love structures and patterns, even in how they consume the tokens and build up their context. The more well-defined the structure or pattern is to be used as instructions, the more likely the agent would be able to follow without going off the rail. Hence, we try to make full use of this by converting as many documents to structured formats as possible.

Efficiency is at the core of every decision in this methodology — from reducing unnecessary context switching to designing workflows that eliminate wasted effort. By keeping tasks well-defined and leveraging structured, agent-friendly documents, teams can minimize bottlenecks, onboard quickly, and focus on genuinely valuable work. This approach not only speeds up delivery but also fosters a more enjoyable and productive development environment.

### Developer first

We treat developers as our first-class citizens. And at the same time, we assume that you will be part of the development cycle: to collaborate and monitor the agents closely. This naturally means reading more code and engage more in feedback loops to provide LLMs the context they need. Balancing the between the **time** you let the agents run freely and the **effort** you put in the project to ensure the quality is the key to using these workflows effectively.

But at the same time, we don't want to shoo away any non-coder who would like to give our package a shot or apply the workflows to their own projects. Thus, we assumes our audience are either:

-  Developers who want to actively shape and iterate on their projects.
-  Builders who are eager to:
   -  Understand _how the code works_ (with guidance from our agents)
   -  And have a clear grasp of their project’s specifications and requirements.

### Flexible at all scales

The set of workflows we offer can be switch in between flexibily depending on your need.

-  You need to start a new project? Kickstart immediately with the Greenfield Worflow.
-  You have a change of plan for the direction of your existing project? Shift the rail with the Brownfield workflow.
-  You have a small change to implement as improvement? Ask the PM agent directly.

Ultimately, the tool can only work well in the right hands of the right user. Your decisions are what drive these workflows forward.

### Simplicity is key

In the original BMAD Method package, 10 agents are assigned with 10 different (and some mixed) responsibilities to mirror a full-fleged agile development team in the real world, with each agent handling different parts of the process.

However, at least in context of software development, Agile Methodology is designed to manage **human** workflows, not **AI**. So we'd argue that this level of concern separation is unnecessary and can be cut down by utilizing the wide context window each modern LLM models are capable of holding. This results in much simpler workflows with less need to constantly switch between multiple agents.

Further more, the command list is also modified to be as minimal, but enough to ensure:

1. Quality of the output
2. You know exactly what the LLM is doing
3. Security

## Quick Start

### Prerequisites

-  Node.js 16+ and npm installed
-  Run the CLI from the root of the target repository

### Installation

```
npx -y bmad-minimal install
```

During installation, you will be prompted for:

-  Project name
-  Whether your app is singular or split into backend/frontend
-  App directory (or backend/frontend directories)
-  Base directory for BMAD files
-  Whether to include planning templates
-  Documentation directory
-  Whether to generate a prompt for your local agent to fill out your own set of coding standards

### Update

```
npx -y bmad-minimal update
```

The update process will be more straight forward. You will be prompted for any missing information in your config.json if any and update confirmation.

## Inspiration & Key Improvements

BMAD Minimal is inspired by the original BMAD-METHOD, but is purposefully refined to make your software development journey happier, faster, and more efficient. Here’s how we make it easier and more delightful to build great projects:

### 1. Minifying the Workflows and Documents

-  **Reduced Agents:**
   -  We cut down from **10 agents to 6**, removing layers that add overhead.
   -  _Analyst, BMAD Master, and Orchestrator_ are fully removed from the workflows.
   -  The **SM (Scrum Master)** and **PO (Project Owner)** roles are now streamlined into a single, approachable **Project Development Master (PDM)**—your all-in-one bridge between high-level plans and engineering.
-  **Simplified Documents:**
   -  Fewer agents mean **fewer documents** to manage—keeping your workflow clean and focused.
   -  The result? Less paperwork, less confusion, more time for the work that matters most.

### 2. Structured Formats & Readibility

To keep things both friendly for humans and clear for LLM agents, every artifact uses an intentionally structured format based on its purpose and audience.

| **Document Type** | **Description**                                                                                   | **Format** |
| ----------------- | ------------------------------------------------------------------------------------------------- | ---------- |
| High-level        | PRD, architecture outlines or human-facing documents                                              | Markdown   |
| Middle-level      | LLM-fiendly documents (epics, stories, etc.) that still requires human monitoring or interference | YAML       |
| Low-level         | Detailed internal agent instructions and guidelines                                               | JSON       |

This hierarchy keeps collaboration smooth and keeps everyone (and every agent) on the same page.

**With these improvements, BMAD Minimal gives you the tools you need to move quickly, collaborate confidently, and enjoy building your next project. The process is lighter, the learning curve is shorter, and the experience is genuinely more fun for teams of any size.**

## Acknowledgements

Special thanks to the BMAD-METHOD team for pioneering the Breakthrough Method for Agile AI-Driven Development. Your vision and ongoing contributions to open, collaborative development have served as a foundation for this project. We appreciate your commitment to empowering modern teams with innovative, agentic workflows and are grateful for the inspiration provided by the OG [project](https://github.com/bmad-code-org/BMAD-METHOD/tree/main).

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## FAQ & Support

If you have any questions or need support, please open an issue on the [GitHub repository](https://github.com/thien2218/bmad-minimal/issues).

Or contact me via [Gmail](bmad.thienhuynh@gmail.com).
