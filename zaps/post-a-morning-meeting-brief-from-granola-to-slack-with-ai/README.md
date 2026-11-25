# Post a morning meeting brief from Granola to Slack with AI

Every weekday morning, you get one Slack DM that picks up where you left off with each person on your calendar that day. AI by Zapier reads your past Granola notes with them and lists what's still open and what's worth raising.

**Apps:** Google Calendar, Granola, Slack, AI by Zapier, Schedule by Zapier

**Needs:** Granola Business or Enterprise. The free plan has no API access, and the Zap reads your notes through Granola's API.

Granola's paid plans can brief you on a meeting inside the app. This Zap puts every brief for the day in one Slack message before you start, and you can change the prompt that writes them.

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-a-morning-meeting-brief-from-granola-to-slack-with-ai

The agent follows `SKILL.md`: it asks for a Granola API key and where the brief should go, then builds, tests and turns on the Zap in your account.

## Make it yours

Ask your agent to add any of these once the basic version works:

- **Add your recent emails** with each guest, from a Gmail search on their address, so the brief catches what happened between meetings.
- **Add Slack threads** you've had with them in the last week.
- **Skip internal meetings** by leaving out guests from your own company's domain.
- **Add open tasks** you share with each guest, from the app your team tracks work in.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings, including what's skipped, how far back to look and the brief prompt
- `connections/`: the accounts it uses (`google-calendar`, `slack`, `ai`)
- `triggers/`: what starts it
