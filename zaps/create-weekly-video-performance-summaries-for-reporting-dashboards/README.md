# Create weekly video performance summaries for reporting dashboards

Give it a YouTube video and a date range, and it returns that video's views, watch time, engagement, revenue and subscriber change in one payload for your dashboard.

**Apps:** Webhooks by Zapier, YouTube

**Based on:** [Create weekly video performance summaries for reporting dashboards](https://zapier.com/automations/data-analytics/data-visualization/automated-report-creation/create-weekly-video-performance-summaries-for-reporting-dashboards) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-weekly-video-performance-summaries-for-reporting-dashboards

The agent follows `SKILL.md`: it asks you for the YouTube channel the videos belong to, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`youtube`)
- `triggers/`: what starts it
