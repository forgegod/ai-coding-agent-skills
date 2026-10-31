---
metadata_version: 1
artifact: spec
capability: local-skill-installation
---
# local-skill-installation Specification

## Purpose

Define safe user-scoped installation and explicit retirement of this
project's local Agent Skills packages across supported local clients.

## Requirements

### Requirement: User-scoped native client installation
The local installer SHALL detect existing Claude Code and Codex user
configurations and install every current complete package in their user-scoped
skill directories. It SHALL NOT use the current project directory as an
installation destination.

#### Scenario: Existing Claude Code configuration
- **WHEN** the user's `.claude` configuration directory exists and Claude Code
  is selected by default or explicitly
- **THEN** each package is installed at `~/.claude/skills/<skill-name>/`
- **AND** no `.claude/skills` directory is created below the checkout

#### Scenario: Existing Codex configuration
- **WHEN** the user's `.codex` or `.agents` configuration directory exists and
  Codex is selected by default or explicitly
- **THEN** each package is installed at `~/.agents/skills/<skill-name>/`
- **AND** no `.agents/skills` directory is created below the checkout

#### Scenario: Absent native client
- **WHEN** a supported native client has no existing user configuration
- **THEN** the installer omits that client without creating its configuration
  or skill directory

### Requirement: Native client installation preserves package safety
The installer SHALL copy the complete canonical package into every selected
native client target. It SHALL preflight collisions across all selected targets,
require explicit update authority to replace an existing package, preserve a
replaced package outside skill discovery, and make no writes in dry-run mode.

#### Scenario: Complete package copy
- **WHEN** a package contains supported reference, script, template, or asset
  files
- **THEN** a native client installation contains the same complete package bytes
  under its flat skill-name directory

#### Scenario: Collision before copy
- **WHEN** any selected native client package destination already exists without
  explicit update authority
- **THEN** the installer refuses before copying or replacing a package in any
  selected target

#### Scenario: Explicit native update
- **WHEN** explicit update authority selects an existing native client package
- **THEN** the installer moves the complete previous package to that client's
  backup area before activating the replacement

### Requirement: Explicit retirement of legacy distribution packages
The installer SHALL remove a historical package only with explicit purge
authority. Its only retirement candidates SHALL be `application-records`,
`phased-plan-closeout`, `phased-plan-design`, `phased-plan-execution`,
`phased-plan-next`, `phased-plan-overview`, and `phased-plan-refactoring`.
Before removal it SHALL preserve the entire package and any matching managed
Hermes registration outside skill discovery.

#### Scenario: Default install retains historical package
- **WHEN** a historical package is present and purge authority is absent
- **THEN** the installer leaves that package and its registration unchanged

#### Scenario: Explicit purge retires a historical package
- **WHEN** explicit purge authority selects a present historical package
- **THEN** the installer moves the package to a backup location and removes its
  live installation
- **AND** a matching managed Hermes registration is backed up and removed from
  the active lock

#### Scenario: Unrelated skill remains installed
- **WHEN** a selected target contains a skill outside the historical package set
- **THEN** purge leaves that skill unchanged

### Requirement: Local-copy provenance remains truthful
The installer SHALL retain its existing distinction between a reviewed local
copy and a scanner-managed installation. Native client installation and purge
SHALL NOT claim Hermes scanner approval or cross-host execution compatibility.

#### Scenario: Native client result
- **WHEN** the installer reports a native client installation or retirement
- **THEN** its usage output and documentation identify it as a local copy rather
  than a Hermes scanner-approved installation
