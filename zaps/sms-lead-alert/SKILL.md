---
name: sms-lead-alert
description: Build a Zap on Zapier that texts the business owner every new lead (name, phone, need, and a suggested reply). Use when someone wants instant lead alerts by SMS from a website form, webhook, or Facebook Lead Ads.
license: MIT
metadata:
  author: andrewckor
  summary: "Texts you every new lead the moment it comes in: their name, number, what they need, and a reply you can send back."
  apps: "Webhooks by Zapier, AI by Zapier, SMS by Zapier, Facebook Lead Ads (optional)"
  category: "Sales"
  job: "Lead management"
---

# SMS lead alert

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/sms-lead-alert. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new lead arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). Any website form can post to it. Facebook Lead Ads "New Lead" can be added as a second trigger.
2. **AI by Zapier** reads the raw submission, even with odd field names, and returns `name`, `phone`, `need` (under 45 characters, with city and timing) and `reply` (a friendly text under 60 characters using the lead's first name).
3. **SMS by Zapier** texts the owner:
   ```
   Maria Lopez
   (201) 555-0148

   Leaking water heater, Union City, today

   Reply: "Hi Maria, I can come by this afternoon. Does 3pm work?"
   ```

The Zap alerts the owner only. It never texts the lead.

## Ask the user

This zap has no `REPLACE_…` values, so nothing is filled in per person. Its settings are the SMS by Zapier connection and the trigger.

- Is their SMS by Zapier connection set up with the phone that should get the alerts? SMS by Zapier only texts the number verified on that connection.
- Where do leads come from: a website form, Facebook Lead Ads, or both?

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `sms` to the user's SMS by Zapier connection, the one with the phone that should get the alerts. Webhooks by Zapier and AI by Zapier need no connection. In the code, `authentication_id: "0"` on the AI step means Zapier's managed AI credentials; leave it as is.
2. **Source:** publish `workflow.ts` as it is, since it has no settings to fill in. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it. The catch hook has no connection. Facebook Lead Ads is an optional second trigger; add it only if the user asks. If your tools take only one trigger per workflow, install the same `workflow.ts` once per trigger and name the copies so the user can tell them apart.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match. The catch hook has no sample to pull; the test lead below is its first input.

## Test it

Run this sample lead as a draft test run before publishing. Posting to the webhook URL only works once the workflow is published.

```json
{
  "full_name": "Maria Lopez",
  "tel": "(201) 555-0148",
  "msg": "Water heater leaking, Union City, can someone come today?"
}
```

Check that the text arrives within about a minute, with the name, number, need and reply filled in.

Then test from the lead source, with test data only:

- **Website form:** submit the form once with a test name and number. Check that the AI still finds the name, phone and need from the form's real field names.
- **Facebook Lead Ads:** with the trigger connected to the right page and form, create a test lead with Meta's Lead Ads Testing Tool, then pull it with the trigger's test and run the workflow. Check that the text arrives for it too.

If run-status tools aren't available, check the text in SMS by Zapier directly. Publish only after these pass, and confirm the trigger is active. The user deletes any test data, not the agent.

## Notes

- SMS by Zapier texts only the verified owner number, so the alerts go to the owner, not the lead.
- Anyone who has the webhook URL can trigger texts. Never commit the URL or a real phone number.
- To change the message format, edit the `message` template in `workflow.ts`. To change reply tone or length, edit the AI `instructions`. To add lead sources, add triggers such as Facebook Lead Ads.
