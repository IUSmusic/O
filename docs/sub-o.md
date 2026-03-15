# Sub O

## Goal

Sub O is a sandboxed world for experimentation, development, app creation, media workflows, compatibility layers, and custom user environments.

## Capabilities

A Sub O may contain:
- its own repo
- files and generated assets
- apps
- runtime stacks
- local indexes and caches
- UI customizations
- AI tools
- snapshots

## Sub O classes

### Native O
Linux-native sandbox with shared host kernel and low overhead.

### Compat O
Native sandbox with compatibility tooling and foreign runtime support installed inside it.

### VM O
Virtualized environment for stronger isolation or special compatibility cases.

## Lifecycle

1. create from template
2. configure permissions and agent mode
3. run and modify
4. snapshot and clone
5. rollback or destroy
6. optionally promote to template or candidate Main O

## Security boundaries

By default, a Sub O cannot:
- read Mother O secrets
- access Mother O files
- inspect other Sub O private state
- use unrestricted network
- touch privileged devices

All cross-boundary access should go through explicit gateways.

## Agent modes

- local_only
- online_brokered
- hybrid
- manual_only
