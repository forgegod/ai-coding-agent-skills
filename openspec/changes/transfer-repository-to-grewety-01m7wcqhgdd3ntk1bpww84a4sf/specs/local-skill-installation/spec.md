# Spec Delta

## MODIFIED Requirements

### Requirement: Local-copy provenance remains truthful
The installer SHALL retain its distinction between a reviewed local copy and a
scanner-managed installation. Fresh local Hermes registrations SHALL use the
current canonical public well-known source. During an explicit update of a
current package or an explicit purge of a retired historical package, it SHALL
recognize only the exact former canonical registration at its expected managed
install path as a managed legacy source (replacing it with the current canonical
registration on update, or backing up and removing it on purge); arbitrary source
or path mismatches SHALL remain conflicts. Native client installation and purge
SHALL NOT claim Hermes scanner approval or cross-host execution compatibility.

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
