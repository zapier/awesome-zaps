# Update strategic KR when tactical KR scope changes

When a tactical KR's watched properties change in Notion, its linked strategic KR gets its scope-change checkbox set, so leadership and ops work from the same priorities.

**Apps:** Notion

**Based on:** [Update strategic KR when tactical KR scope changes](https://zapier.com/automations/executives/strategy-planning/okr-goal-tracking/update-strategic-kr-when-tactical-kr-scope-changes) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-strategic-kr-when-tactical-kr-scope-changes

The agent follows `SKILL.md`: it asks you for your tactical and strategic KR databases and the properties that link and flag them, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`notion`)
- `triggers/`: what starts it
