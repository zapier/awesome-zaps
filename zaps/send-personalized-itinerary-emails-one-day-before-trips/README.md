# Send personalized itinerary emails one day before trips

When a trip is added to your travel calendar, the traveler gets a personalized itinerary email with their link, one day before they leave.

**Apps:** Google Calendar, Gmail

**Based on:** [Send personalized itinerary emails one day before trips](https://zapier.com/automations/personal-productivity/travel-hosting/itinerary-management/send-personalized-itinerary-emails-one-day-before-trips) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-personalized-itinerary-emails-one-day-before-trips

The agent follows `SKILL.md`: it asks you for your travel calendar, your itinerary site's address and the sender address, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-calendar`)
- `triggers/`: what starts it
