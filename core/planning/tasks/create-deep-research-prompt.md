# Create Deep Research Prompt Task

This task helps create comprehensive research prompts centered on project idea exploration, user understanding, and technical feasibility. It can process inputs from brainstorming sessions, project briefs, or specific research questions to generate targeted prompts focused on product vision, user needs, and technical considerations.

## Purpose

Generate well-structured research prompts that:

- Define clear investigation objectives and scope
- Specify appropriate research methodologies
- Outline expected deliverables and formats
- Guide systematic exploration of project ideas, user insights, and technical aspects
- Ensure actionable findings relevant to product development are captured

## Research Focus Selection

CRITICAL: First, help the user select the most appropriate research focus based on their needs and any input documents they've provided. Keep the focus on project ideas, user perspectives, and technical feasibility.

### Research Focus Options

Present these numbered options to the user:

1. **Project Concept Exploration**

   - Clarify the core product idea and value proposition
   - Identify differentiating features or innovations
   - Define problem statements and solution framing
   - Surface assumptions that require validation

2. **User & Customer Understanding**

   - Profile target users, personas, and contexts
   - Map goals, pains, and desired outcomes
   - Understand user workflows and journeys
   - Capture feedback needed to validate desirability

3. **Technical Feasibility Discovery**

   - Assess technical approaches and architectural choices
   - Identify enabling technologies and constraints
   - Outline proof-of-concept or prototype requirements
   - Surface implementation risks and dependencies

4. **Custom Research Focus**
   - User-defined objectives aligned with project, user, or technical investigation
   - Specialized domain exploration within these boundaries

### Input Processing

**If Project Brief provided:**

- Extract key product concepts and goals
- Identify target users and use cases
- Note technical constraints, preferences, and open questions
- Highlight uncertainties and assumptions needing deeper investigation

**If Brainstorming Results provided:**

- Synthesize main ideas and themes
- Identify areas needing validation
- Extract hypotheses to test with users or technical experiments
- Note creative directions that require deeper exploration

**If Starting Fresh:**

- Gather essential context through questions
- Define the problem space and desired outcomes
- Clarify research objectives for project, user, or technical focus
- Establish success criteria for the investigation

## Process

### Research Prompt Structure

CRITICAL: collaboratively develop a comprehensive research prompt with these components.

#### A. Research Objectives

CRITICAL: collaborate with the user to articulate clear, specific objectives tied to project concepts, user insights, or technical feasibility.

- Primary investigation goal and purpose
- Key decisions the research will inform
- Success criteria for the research
- Constraints and boundaries

#### B. Research Questions

CRITICAL: collaborate with the user to develop specific, actionable research questions organized by theme.

**Core Questions:**

- Central questions about the product idea, user needs, or technical viability that must be answered
- Priority ranking of questions
- Dependencies between questions

**Supporting Questions:**

- Follow-up questions to deepen understanding
- Additional context-building questions
- Future-looking considerations related to product evolution

#### C. Research Methodology

**Information Sources & Methods:**

- User interviews, surveys, usability tests, or feedback loops
- Technical spikes, prototypes, or proof-of-concept experiments
- Review of internal documentation, previous projects, or domain knowledge
- Criteria for credible and useful inputs

**Analysis & Synthesis Approaches:**

- Frameworks for evaluating user insights (e.g., JTBD, persona mapping)
- Technical evaluation checklists or architecture reviews
- Methods for synthesizing findings into actionable recommendations

#### D. Output Requirements

**Format Specifications:**

- Executive summary highlighting key findings
- Sections dedicated to project concept clarity, user insights, and technical feasibility
- Visuals, diagrams, or tables if needed to communicate results
- Supporting documentation expectations (e.g., interview notes, prototype results)

**Key Deliverables:**

- Must-have insights for the product team
- Decision-support elements for next planning steps
- Action-oriented recommendations and experiments
- Identified risks, assumptions, and follow-up questions

### Prompt Generation

**Research Prompt Template:**

```markdown
## Research Objective

[Clear statement of what this research aims to achieve for the project idea, user understanding, or technical feasibility]

## Background Context

[Relevant information from project brief, brainstorming, technical notes, or other inputs]

## Research Questions

### Primary Questions (Must Answer)

1. [Specific, actionable question]
2. [Specific, actionable question]
   ...

### Secondary Questions (Nice to Have)

1. [Supporting question]
2. [Supporting question]
   ...

## Research Methodology

### Information Sources & Methods

- [Specific user research, technical investigation, or document review approaches]

### Analysis Approaches

- [Frameworks or evaluation criteria to apply]

### Data & Evidence Requirements

- [Quality, recency, credibility needs]

## Expected Deliverables

### Executive Summary

- Key findings and insights
- Critical implications
- Recommended actions

### Detailed Analysis

[Specific sections for project concept insights, user findings, and technical evaluation]

### Supporting Materials

- Interview notes or transcripts
- Prototype or experiment results
- Technical documentation references

## Success Criteria

[How to evaluate if research achieved its objectives]

## Timeline and Priority

[If applicable, any time constraints or phasing]
```

### 5. Review and Refinement

1. **Present Complete Prompt**

   - Show the full research prompt
   - Explain key elements and rationale
   - Highlight any assumptions made

2. **Gather Feedback**

   - Are the objectives clear and correct?
   - Do the questions address all concerns?
   - Is the scope appropriate?
   - Are output requirements sufficient?

3. **Refine as Needed**
   - Incorporate user feedback
   - Adjust scope or focus
   - Add missing elements
   - Clarify ambiguities

### Next Steps Guidance

**Execution Options:**

1. **Use with AI Research Assistant**: Provide this prompt to an AI model with project, user, or technical research capabilities
2. **Guide Human Research**: Use as a framework for manual research efforts
3. **Hybrid Approach**: Combine AI and human research using this structure

**Integration Points:**

- How findings will feed into planning artifacts (project brief, PRD, architecture)
- Which team members should review results
- How to validate findings with stakeholders or technical leads
- When to revisit or expand research based on outcomes

## Important Notes

- The quality of the research prompt directly impacts the quality of insights gathered
- Be specific rather than general in research questions
- Consider both current state and future implications
- Balance comprehensiveness with focus
- Document assumptions and limitations clearly
- Plan for iterative refinement based on initial findings
