# NexHello business card to Notion

Scan a business card with NexHello and the contact lands in your Notion contacts database. Scan the same person again and the row is updated, never duplicated.

Based on [NexHello's guide to sending business cards to Notion with Zapier](https://www.nexhello.com/integrations/business-card-to-notion-with-zapier/).

**Apps:** Webhooks by Zapier, Notion

## How it works

**Starts with:** Webhooks by Zapier Catch Hook

1. Skip NexHello's connection test and events without a contact. Stops if it is not a contact event.
2. Find the contact by NexHello Contact ID (Notion)
3. **Not found:** Create the contact (Notion)
4. Update the contact's fields (Notion)

## What you need

- Notion

## Install it

Paste this into Claude, ChatGPT, Cursor, or any agent with [Zapier MCP](https://zapier.com/mcp) connected:

> Install the Next Gen Zap at https://zapier.sh/zaps/nexhello-business-card-to-notion using Zapier MCP.

If you have this repo, the files in this folder are everything the agent needs: it follows `SKILL.md` and deploys `workflow.ts`.

## Files

- `workflow.ts`: the Next Gen Zap code
- `SKILL.md`: how an agent builds it, what to ask you, and how to test it
