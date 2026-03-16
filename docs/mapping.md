# O Mapping System

## Purpose

The O Mapping System defines visible, policy-controlled relationships between Sub O worlds.

## Examples

- one Sub O serves a repo to another
- one Sub O provides assets to another
- one Sub O hosts a local service for another
- a world is visible only to Mother O
- a world is allowed to expose APIs only to selected mapped worlds

## Relation types

- repo_provider
- asset_provider
- service_provider
- service_consumer
- shared_library
- trusted_peer
- isolated_peer

## Rules

- relations are explicit, never accidental
- relations are visible as a graph
- relations are runtime and sharing structures, not boot dependencies
- firewall and trust edges are attached to relations
- relations may be revoked without collapsing Mother O boot safety
