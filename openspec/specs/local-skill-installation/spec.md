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
Reviewed local copies SHALL be distinct from scanner-managed installs.
Fresh local Hermes registrations SHALL use the current canonical public well-known source.
Only explicit current-package updates or explicit retired-package purges SHALL
accept the exact former canonical entry at the expected managed install path:
replace with current on update; back up and remove on purge.
Mismatches SHALL conflict. Native installs/purges SHALL NOT claim Hermes
scanner approval or cross-host compatibility.

#### Scenario: Fresh local Hermes installation
- **WHEN** the local installer installs a selected package into a scratch Hermes
  profile without an existing managed registration
- **THEN** the registration uses the current canonical well-known identifier
- **AND** the registration remains community/unscanned local-copy provenance

#### Scenario: Exact legacy registration transition
- **WHEN** an explicitly authorized local-installer update finds a selected
  package registered at the exact former canonical well-known identifier and its
  expected managed install path
- **THEN** it replaces that selected registration with the current canonical
  identifier while preserving the package's local-edit, collision, backup, and
  scanner safeguards

#### Scenario: Explicit purge of legacy-registered retired package
- **WHEN** an explicitly authorized local-installer purge selects a present
  retired historical package registered at the exact former canonical well-known
  identifier and its expected managed install path
- **THEN** the installer recognizes that registration as a managed legacy entry,
  backs up the complete package and its registration outside skill discovery, and
  removes the retired package and active lock entry without treating the former
  canonical identifier as a conflict

#### Scenario: Fresh install refuses orphaned legacy registration
- **WHEN** a default local-installer run without explicit `--update` authority
  encounters a selected package whose lock entry already exists at the exact
  former canonical well-known identifier (including when its package directory
  is absent)
- **THEN** the installer refuses before modifying that registration or any
  selected profile, requiring explicit `--update` authority to transition the
  legacy registration

#### Scenario: Conflicting source remains protected
- **WHEN** a selected package has a registration with any source, identifier, or
  install path other than the current managed value (or, during explicit
  `--update` of a current package or explicit `--purge` of a retired historical
  package, the exact former managed value at its expected install path)
- **THEN** the installer refuses before changing that registration or any selected
  profile

#### Scenario: Native client result
- **WHEN** the installer reports a native client installation or retirement
- **THEN** its usage output and documentation identify it as a local copy rather
  than a Hermes scanner-approved installation
