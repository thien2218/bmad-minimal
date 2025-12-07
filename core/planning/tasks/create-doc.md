# Create Document from Template (YAML Driven)

## Purpose and Operating Mode

This file defines an executable, interactive workflow that an LLM must follow to create a document from a YAML template. It is not reference material; it is a step-by-step procedure.

High-level rules:

1. Disable all efficiency or auto-advance optimizations. Run strictly step-by-step with user checkpoints.
2. Never synthesize a complete document without following the interaction steps.
3. When a section has `elicit: true`, you must pause and run the 1–9 elicitation menu, then wait for the user.
4. Do not change the elicitation format. Do not ask yes/no questions.

Violation Indicator: If you produce a complete document without user interaction, you have violated the workflow.

## Prerequisite: Template Discovery

If a YAML template is not provided by the user:

1. List available templates from `@{baseDir}/planning/templates`.
2. Ask the user to choose one or provide a different template.
3. Do not proceed until a template is selected.

## State and Configuration

When starting:

1. Parse the YAML template (metadata + sections).
2. Set current mode to `Interactive` (default). Confirm the output file path with the user.
3. Maintain these state variables in your reasoning:
   -  `mode`: `Interactive` or `YOLO` (toggled by user via `#yolo`).
   -  `current_section`: name/index of the section being processed.
   -  `output_file`: target path to write incremental results.
   -  `permissions`: owner/editors/readonly per section.

## Processing Algorithm (Do This Sequentially)

For each section in order:

1. Evaluate conditions; skip section if its condition is not met.
2. Check agent permissions and note any restrictions:
   -  `owner`: who initially creates the section.
   -  `editors`: who may modify it.
   -  `readonly`: if it becomes immutable after creation.
      When a section is restricted, include a note in the output, for example: "_(This section is owned by dev-agent and can only be modified by dev-agent)_".
3. Draft the section using the section-specific instruction.
4. Present the drafted content and a Detailed Rationale (see next section).
5. If `elicit: true`, execute the Mandatory Elicitation Protocol (1–9 menu) and wait for user input.
6. Save/append the approved content to `output_file` (if supported by the environment).
7. Continue to the next section.

Stop conditions:

-  In `Interactive` mode, you must not proceed past an `elicit: true` checkpoint without a user response.
-  In `YOLO` mode, process all sections without stopping, but still include rationale for each section.

## Detailed Rationale (Always Include)

Each time you present a section’s content, also include rationale that explains:

-  Trade-offs and choices made (what was chosen over alternatives and why)
-  Key assumptions made during drafting
-  Interesting or questionable decisions that may need user attention
-  Areas that might need validation

## Mandatory Elicitation Protocol (elicit: true)

When a section has `elicit: true`, you must HARD-STOP and run the numbered menu. Do not ask yes/no questions. Do not change the format.

Menu requirements:

1. Present the section content.
2. Provide the Detailed Rationale.
3. Stop and present options 1–9 using the following template:

```
1) Proceed to next section
2) <method from data/elicitation-methods>
3) <method from data/elicitation-methods>
4) <method from data/elicitation-methods>
5) <method from data/elicitation-methods>
6) <method from data/elicitation-methods>
7) <method from data/elicitation-methods>
8) <method from data/elicitation-methods>
9) <method from data/elicitation-methods>

Select 1-9 or just type your question/feedback:
```

Rules for options:

-  Option 1 is always exactly: "Proceed to next section".
-  Options 2–9 must be chosen from `data/elicitation-methods` (no custom methods).
-  After showing the menu, wait for the user and do not proceed until a response is received.

Workflow violation: Creating content for `elicit: true` sections without user engagement violates this task.

## Elicitation Result Handling (after user selects 2–9)

1. Execute the chosen method from `data/elicitation-methods`.
2. Present the results and any insights learned.
3. Offer exactly these options and wait:
   -  1. Apply changes and update section
   -  2. Return to elicitation menu
   -  3. Ask any questions or engage further with this elicitation

## YOLO Mode

The user can type `#yolo` to toggle to YOLO mode. In YOLO mode, process all sections in one pass (no interactive stops). Still provide rationale for each section and honor permissions.

## Critical Reminders

**❌ NEVER:**

-  Ask yes/no questions for elicitation
-  Use any format other than 1-9 numbered options
-  Create new elicitation methods

**✅ ALWAYS:**

-  Use exact 1-9 format when elicit: true
-  Select options 2-9 from data/elicitation-methods only
-  Provide detailed rationale explaining decisions
-  End with "Select 1-9 or just type your question/feedback:"
