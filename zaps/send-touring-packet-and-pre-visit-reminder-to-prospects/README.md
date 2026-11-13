# Send touring packet and pre-visit reminder to prospects

When a tour is booked on Google Calendar, the prospect gets an email with your touring packet link a day before the visit, so nobody has to send it by hand.

**Apps:** Google Calendar, Gmail

**Based on:** [Send touring packet and pre-visit reminder to prospects](https://zapier.com/automations/business-owners/hospitality-operations/booking-confirmation-workflows/send-touring-packet-and-pre-visit-reminder-to-prospects) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-touring-packet-and-pre-visit-reminder-to-prospects

The agent follows `SKILL.md`: it asks you for your tour calendar, the search term its events share, your Gmail account, the touring packet link and the name the email is signed with, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-calendar`)
- `triggers/`: what starts it
