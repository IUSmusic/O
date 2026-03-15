# Architecture

## System overview

O has two major execution domains:

- Mother O: protected control plane
- Sub O: sandboxed execution worlds

## High-level layers

```text
Hardware
↓
Linux kernel + device support
↓
Mother O core services
↓
Policy, trust, brokers, update, privacy ledger, sandbox lifecycle
↓
Sub O environments
↓
Apps, runtimes, generated software, developer tools, media tools
```

## Mother O responsibilities

- boot and recovery orchestration
- device and capability discovery
- trust store and certificate handling
- sandbox lifecycle manager
- local model runtime manager
- online model broker
- firewall and network mediation
- privacy ledger
- promotion and rollback manager
- update engine
- template registry
- storage authority

## Sub O responsibilities

- repo-backed workspace
- apps and generated assets
- runtime toolchains
- local caches and indexes
- user-selected AI mode
- isolated file and process space
- snapshots and rollback points

## Implementation guidance

### Core languages
- Mother O services: Rust
- kernel base: Linux
- tooling and converters: Python
- UI shell: web tech or Rust-native UI, depending product direction
- Sub O runtimes: user-selectable

### Isolation model
Default isolation should use:

- namespaces
- cgroups
- seccomp
- policy-driven device access
- per-Sub-O network controls
- optional VM-based Sub O for high-risk or compatibility cases

## Persistence model

Mother O stores:
- system state
- certificates
- device policy
- snapshots
- trust metadata

Sub O stores:
- repo contents
- app state
- generated code
- media assets
- local indexes
- toolchain state

## Update model

- signed update artifacts
- staged activation
- atomic switch
- health checks
- rollback on failure
