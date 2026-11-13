# Create design request cards from inbound email requests

When a design request arrives by email, a Trello card is created on your intake list with the details filled in, so nothing gets lost in an inbox.

**Apps:** Email by Zapier, Trello

**Based on:** [Create design request cards from inbound email requests](https://zapier.com/automations/design/design-project-management/design-request-intake/create-design-request-cards-from-inbound-email-requests) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-design-request-cards-from-inbound-email-requests

The agent follows `SKILL.md`: it asks you for the request mailbox name, your Trello board and intake list, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`trello`)
- `triggers/`: what starts it
