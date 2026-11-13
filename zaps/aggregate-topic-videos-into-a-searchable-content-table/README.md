# Aggregate topic videos into a searchable content table

New YouTube videos on your topic are added to a searchable table with their title, channel, link, publish date and description, ready for tagging and scheduling.

**Apps:** YouTube, Zapier Tables

**Based on:** [Aggregate topic videos into a searchable content table](https://zapier.com/automations/personal-productivity/news-content-feeds/content-aggregation/aggregate-topic-videos-into-a-searchable-content-table) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/aggregate-topic-videos-into-a-searchable-content-table

The agent follows `SKILL.md`: it asks you for your search topic, the keyword a title must contain and your content table, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`youtube`, `zapier-tables`)
- `triggers/`: what starts it
