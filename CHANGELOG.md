# Changelog

All notable changes to this project will be documented in this file.
This format follows Keep a Changelog and the project adheres to Semantic Versioning.

## [1.2.0] - 2025-11-22

### Added

-  add new analyst agent
-  add new task for analyst agent
-  add number index for prds
-  add new commands for pm and architect agents to update docs
-  add new switch-agent command to all agents

### Changed

-  Bump version to 1.2.0
-  remove pm agent and enable analyst agent to do more
-  rename brownfield tasks and move standalone story task to pdm agent
-  remove brownfield subdirectory
-  remove old workflows and update the commands to use prds folder
-  remove unnecessary tasks and templates for brownfield flow
-  remove unused code

### Fixed

-  fix output format of stories and epics
-  remove old legacy check code

## [1.1.0] - 2025-10-08

### Docs

-  complete development workflow document
-  complete planning workflow document
-  basic outline for planning guide
-  complete readme file and remove unnecessary rule for planning agents for furture release
-  complete layout for the main readme

### Changed

-  make coding standards file more flexible with clear guidance for its content
-  refactor cli tooling and update coding-standards template
-  update commands for architect agents
-  make story id more consistent
-  rename all story and epic creation tasks for consistency

### Chore

-  1.0.12

## [1.0.11] - 2025-09-09

### Changed

-  improve UX for install and update commands

### Chore

-  1.0.11

## [1.0.10] - 2025-09-09

### Fixed

-  fix issue with coding standards not updating

### Chore

-  1.0.10

## [1.0.9] - 2025-09-09

### Fixed

-  fix incorrect file name

### Chore

-  1.0.9

## [1.0.8] - 2025-09-09

### Changed

-  centralize coding standards and delegate tech preferences to architecture files

### Added

-  add required field to templates

### Chore

-  1.0.8

## [1.0.7] - 2025-09-09

### Added

-  add a step to enforce brownfield file creation when needed
-  add new generic architecture template
-  add new tasks for brownfield enhancement
-  complete cli app for installing bmad-minimal
-  add new rule for planning agents to prioritize attached files
-  add new rule for planning agents to prioritize attached files
-  added new task for qa agent to review test specs
-  feat: create a new cli package with initial implementation
-  add new task for dev
-  add technical preferences file
-  add elicitation data for engineering
-  use json schemas for epics, stories and qa-gates
-  add back tasks/checklists/data for planning agents
-  add schemas for internal task, checklist, data file creation and use json for config
-  create task to add/update docs for dev
-  add back nfr assessment
-  add dev for feasibility feedback and qa for test strat assessment in story creation workflow
-  add estimation in templates for pdm agent
-  add new template for epic creation and new agent for better workflow
-  added data

### Fixed

-  fix inconsistent story schema
-  resolve issue with agents not able to resolve config.json
-  fix inconsistent story status
-  fix bug with update command not working
-  patch agents failing to understand instruction files
-  fix the update command
-  fix some language/library detection issue
-  fix typo
-  resolve mismatches and docs path resolver
-  fix file names for brownfield and fullstack architecture files
-  fix minor issues
-  fix tasks inconsistency with schema
-  fix lingering issues with correct-course and update-docs tasks
-  fix engineering tasks
-  fix incorrect references and add back nfr-assess task
-  fix incorrect config file name
-  update validate story task and change misconfigured schema refs
-  fix missing dependencies for qa agent

### Removed

-  remove story and epic prefix for conciseness
-  remove language detection overcomplicate
-  remove build tools from tech pref init
-  remove unnecessary create-brownfield-story
-  remove sharding completely
-  remove redundancy
-  remove unnecessary prd sharding step
-  remove dev feasibility checking and delegate to pdm agent
-  remove redundant qa step
-  remove qa interference with coding
-  remove nfr assess and separate a develop story task
-  remove shard-doc task

### Changed

-  enforce stricter steps to create source tree/project structure
-  default ignore bmad-minimal dir
-  update dev rule ids and fix qa gate overlapping qa result
-  update missing sections in prd and architecture templates
-  use normal file anem to avoid hidden constraint
-  make config fields discrepancy detectable for update command
-  enforce file naming convention and make test dirs configurable
-  enforce planning agents and consolidate PRD workflows under analyst agent
-  update package to public namespace
-  refactor config defaults and update readme
-  new workflows to fit more generic use cases
-  make architecture files be able to match without prefix
-  use generic 'architecture' name instead of fullstack
-  rename subDirs to subdirs
-  update brownfield-create-story task for consistency with create-next-story task
-  delegate filling out tech prefs to user
-  improve installation ux and fix bug while resolving project paths
-  optimize and refactor tbd replacement
-  optimize and refactor tbd replacement
-  refactor libraries extraction
-  simplify libraries extraction and refactoring
-  complete revamp cli app
-  peel back 1 layer of abstraction
-  change internal schema location
-  update config rule to help agents resolve paths without ambiguity
-  update final last bit of architecture docs guide
-  update architecture file pattern
-  update validation for tasks
-  use @ to refer to config and remove sharding
-  update architecture files to follow new config structure
-  further resolve discrepancy
-  update to latest config structure
-  rename front-end-spec for consistency
-  update po and sm to pdm agent
-  update file paths to use from config for consistency
-  refactor epics and stories location path
-  use config for all core file reference
-  move risk mitigation to story level
-  remove ambiguity for test, lint and build commands
-  remove assumption about tech used
-  more refactoring and formatting
-  use more consistent naming for epic and story
-  more refactoring
-  update trademark and config
-  refactor prefix
-  update examples to be more consistent
-  further remove redundancy and add new flow for dev and qa
-  change file name to match with new agent
-  update engineering outputs to focus yaml over markdown for non-human facing docs
-  new folder structure
-  rename phases to agents
-  optimize user-end docs to use yaml instead
-  migrate all engineering tasks/checklists/data to YAML
-  refine pdm agent
-  update epic-tmpl.yaml
-  update structure to publish package
-  update planning agents for web based planning
-  refine engineering agents' activation instructions and remove sm and po agents
-  update docs to use new agent instead of sm and po
-  complete breaking down all engineering agents

### Reverts

-  revert fsArchitecture and change changelog to brownfield
-  revert develop-story flow to standard dev flow

### Chore

-  1.0.6
-  1.0.5
-  1.0.4
-  1.0.3
-  apply formatting
-  final touches
-  apply formatting

[Unreleased]: https://github.com/thien2218/bmad-minimal/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/thien2218/bmad-minimal/compare/v1.0.11...v1.1.0
[1.0.11]: https://github.com/thien2218/bmad-minimal/compare/v1.0.10...v1.0.11
[1.0.10]: https://github.com/thien2218/bmad-minimal/compare/v1.0.9...v1.0.10
[1.0.9]: https://github.com/thien2218/bmad-minimal/compare/v1.0.8...v1.0.9
[1.0.8]: https://github.com/thien2218/bmad-minimal/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/thien2218/bmad-minimal/tree/v1.0.7
