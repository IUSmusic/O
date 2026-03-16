# Sub O

## Definition

A Sub O is an isolated, repo-backed programmable world created inside Mother O.

By default, every Sub O has:
- repo identity
- manifest
- file tree
- runtime/toolchain state
- local prompts/history/memory
- generated code and assets
- app state
- caches and indexes
- relation metadata
- network and security policy
- snapshots

## AI modes

AI is optional.

Supported modes:
- local_only
- online_brokered
- hybrid
- manual_only

## Runtime classes

A Sub O declares its runtime class when created:
- native
- compat
- vm
- or mixed where supported and declared

## Service exposure

A Sub O may expose local services to:
- only Mother O
- only selected Sub O
- any allowed mapped Sub O

Service exposure is always explicit and policy-declared.

## Lifecycle

1. create from template or blank world
2. assign repo identity and policy
3. run and modify
4. snapshot or clone
5. expose relations if allowed
6. promote to template or Main O candidate if allowed
7. delete or nuke

## Nuke behavior

Nuking a Sub O must ask the user whether to:
- preserve snapshots
- erase snapshots
- fully remove all traces where possible
