# Architecture

## Top-level model

O has two major execution domains:

- **Mother O**: the protected, full-featured flagship environment and control plane
- **Sub O**: isolated repo-backed programmable worlds

## High-level layers

```text
Hardware
↓
Linux kernel + device support
↓
Mother O protected services and shell
↓
Gateways, brokers, trust, firewall, privacy ledger, update/promotion logic
↓
Sub O worlds
↓
Apps, runtimes, generated software, media tools, services
```

## Mother O

Mother O is not a thin supervisor. It is a full operating system by default.

It includes:
- file manager
- terminal
- logs
- settings
- media tools
- image viewer
- audio player
- full-featured code editor
- browser/web runtime
- ordinary apps
- generated apps
- system dashboard and controls
- Sub O management
- The Library access

It also owns:
- boot and recovery
- trust and certificates
- firewall
- sandbox lifecycle
- local model runtime
- online model broker
- privacy ledger
- promotion and rollback
- template registry
- O Mapping graph
- device and peripheral management

## Sub O

Each Sub O is an isolated programmable world with:
- repo identity by default
- its own files
- its own runtime stack
- its own prompts/history/memory
- its own generated code and assets
- its own caches and indexes
- its own snapshots
- its own declared relations

A Sub O may be:
- native
- compat
- vm
- or mixed if its manifest and system support allow it

## Gateways

Sensitive cross-boundary actions occur through gateways:
- File Gateway
- Model Gateway
- Network Gateway
- Device Gateway
- Promotion Gateway
- Share Gateway
- O Mapping Gateway

## The Library

The Library is O’s structured memory and evolution system. It stores machine-native software, graphics, music, templates, worlds, and policy objects with identity, lineage, trust, and provenance.
