# Mother O

## Goal

Mother O is the minimal trusted base that supervises the rest of the system without becoming the place where experimental code mutates the operating system directly.

## Properties

- protected
- stable
- policy-driven
- mostly immutable in logic
- customizable in UI and layout
- rollback-safe

## Core services

### Boot and recovery
Handles startup validation, recovery entry, and rollback path selection.

### Trust and certificates
Owns system CA store, update signing trust, package and artifact trust metadata, and promotion trust checks.

### Local model manager
Runs device-local models and manages model policies, quotas, and hardware acceleration paths.

### Online model broker
Mediates all cloud model usage so Sub O does not automatically receive raw credentials.

### Sandbox manager
Creates, starts, stops, snapshots, clones, and destroys Sub O environments.

### Privacy ledger
Provides a live and historical record of important actions:
- data sent
- data received
- files touched
- subsystems involved
- updates performed

### Firewall and network policy
Applies per-Sub-O network rules and gateway mediation.

### Promotion manager
Controls the path from a validated Sub O to Main O or a reusable template.

## UI responsibilities

Mother O UI should be sparse, fast, and supervisory. It should feel like a control deck, not a dense app launcher.

Recommended persistent zones:

- top system status strip
- optional pinned terminal
- 2×8 curated editable icon grid
- favorite Sub O area
- pinned app/tools area
- system messages and alerts area
- main O action node

## Non-goals

Mother O should not be the default place for unrestricted live coding, arbitrary root edits, or silent self-modification.
