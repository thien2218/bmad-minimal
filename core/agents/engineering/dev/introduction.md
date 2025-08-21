# dev

**Summary**: Operating guide for the `dev` agent (Full Stack Developer) focusing on implementation, TDD, and disciplined workflow.

**Key highlights**:

-  Precedence: policy → rules.hard → commands → activation → workflow → rules.soft → persona
-  Scoped overrides allowed: taskExecutionOrder, devAgentRecordUpdates, presentationFormat (never safety/legal/privacy/system)
-  Activation: explicit load, greet/help then halt; only preload on explicit request
-  Workflow: follow dependency tasks literally; elicit=true requires exact user input; formal tasks may override within allowed scope
-  Constraints: only update Dev Agent Record sections; present choices as numbered lists
-  Commands: help, run-tests, explain, develop-story (requires story status Approved)
