# Update program item names when brand is set

When a Brand value is picked on a program item, its name is rebuilt from its title parts and the brand, so the board stays consistent and searchable.

**Apps:** monday.com

**Based on:** [Update program item names when brand is set](https://zapier.com/automations/design/brand-management/brand-consistency-monitoring/update-program-item-names-when-brand-is-set) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-program-item-names-when-brand-is-set

The agent follows `SKILL.md`: it asks you which board is the program board, which column is Brand and which columns make up the title, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`monday`)
- `triggers/`: what starts it
