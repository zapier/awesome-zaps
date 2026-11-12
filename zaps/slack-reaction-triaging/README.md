# Slack reaction to triage channel

React to a Slack message with :ticket: and it's posted to your triage channel with a link back to it. This is the zap [zapier.sh](https://zapier.sh) shows on its homepage.

**Apps:** Slack

## Build it

From a terminal:

```bash
npx zap-pack add awesome-zaps/slack-reaction-triaging
```

Or paste this into any AI agent with [Zapier MCP](https://zapier.com/mcp) connected:

> Build me this Next Gen Zap using Zapier MCP: https://zapier.sh/zapier/awesome-zaps/slack-reaction-triaging/

## Files

- `SKILL.md`: what the agent builds, asks and tests
- `workflow.ts`: the Next Gen Zap code
- `config.ts`: its settings
- `connections/`: the accounts it uses (`slack`)
- `triggers/`: what starts it
