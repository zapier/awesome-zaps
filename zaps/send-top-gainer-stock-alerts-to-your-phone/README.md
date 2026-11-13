# Send top gainer stock alerts to your phone

Market text posted to a webhook is scanned for stock tickers. Each new ticker is saved to your stocks table and texted to your phone with a search link, so movers show up without checking a feed.

**Apps:** Webhooks by Zapier, AI by Zapier, Zapier Tables, SMS by Zapier

**Based on:** [Send top gainer stock alerts to your phone](https://zapier.com/automations/personal-productivity/personal-finance/investment-tracking/send-top-gainer-stock-alerts-to-your-phone) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-top-gainer-stock-alerts-to-your-phone

The agent follows `SKILL.md`: it asks you which Zapier Tables table holds your stocks and which phone gets the alerts, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`ai`, `sms`, `zapier-tables`)
- `triggers/`: what starts it
