# AI Execution Model

## Modes

Both Mother O and Sub O can use:
- local_only
- online_brokered
- hybrid
- manual_only

## Default posture

- local AI is the default
- online AI is optional and brokered by default
- direct API credential injection is user-authorized only, never silent

## Local model execution

Local model execution should support:
- coding assistance
- app generation
- graphics generation
- music generation
- risk explanation
- shell/tool assistance

## Brokered online execution

Brokered online execution must support:
- credential mediation
- redaction
- usage policy
- logging to the privacy ledger
- explicit network posture compatibility

## First proof requirement

The first proof on the reference device requires both:
- local AI
- brokered online AI
