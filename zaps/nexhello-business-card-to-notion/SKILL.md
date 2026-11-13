---
name: nexhello-business-card-to-notion
description: Build a Zap on Zapier that sends every business card scanned with NexHello into a Notion contacts database. A webhook catches the contact NexHello sends, the code skips the connection test and anything without a contact ID, Notion finds the row by NexHello Contact ID (or creates it), and the row is updated with name, company, job title, email, phone, LinkedIn, website, address, about this person and the original card text. Use when someone scans business cards with NexHello and wants them in Notion without duplicates.
license: MIT
metadata:
  author: andrewckor
  summary: "Scan a business card with NexHello and the contact lands in your Notion contacts database. Scan the same person again and the row is updated, never duplicated."
  apps: "Webhooks by Zapier, Notion"
  category: "Sales"
  job: "Contact management"
---

# NexHello Business Card to Notion

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/nexhello-business-card-to-notion. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** Webhooks by Zapier catch hook (`webhook`, `hook_v2`). NexHello posts the contact you pick after a scan to the hook's URL.
2. **Filter:** stops unless the event `type` is `contact.activity.recorded` and the contact has an ID. NexHello's connection test (`webhook.test`, no contact) stops here, so it never creates a row.
3. **Notion** finds the row in the NexHello Contacts database whose **NexHello Contact ID** equals the contact's ID. If none matches, Notion creates one with the ID and first name.
4. **Notion** updates that row with the contact's fields:

   | Notion property    | From NexHello                                          |
   | ------------------ | ------------------------------------------------------ |
   | First Name (title) | `data.contact.first_name`                              |
   | Last Name          | `data.contact.last_name`                               |
   | Company            | `data.contact.company`                                 |
   | Job title          | `data.contact.job_title`                               |
   | Primary email      | `data.contact.email` (lowercased)                      |
   | Primary phone      | `data.contact.phone`                                   |
   | LinkedIn           | `data.contact.linkedin` (gets `https://` if missing)   |
   | Website            | `data.contact.website` (gets `https://` if missing)    |
   | Address            | `data.contact.address`                                 |
   | About this person  | `data.contact.about_this_person`                       |
   | Original text type | `raw.payload_type`                                     |
   | Original text      | `raw.payload` (first 2,000 characters, Notion's limit) |

   Empty incoming fields are left out of the update, so existing Notion values stay.

The match key is NexHello's contact ID, so a person scanned again updates their row and the Zap never creates a second one.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                         | What goes there                                                                                                                                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_NOTION_DATA_SOURCE_ID` | The data source ID of the Notion database that holds the contacts (the NexHello Contacts one). Pick it from the Notion action's data source choices, not the database ID in the page URL. |

Also review the defaults with them: `PROPS` in `workflow.ts` maps each field to a Notion column and type. The names and types there match the NexHello Contacts template, so ask whether any column is named or typed differently (for example Primary email as plain text) and change it in `PROPS`. Ask whether they want any field left out, and whether they want the NexHello `notes` field written to a column; it isn't written by default.

Prerequisites: the database needs the columns above plus a **NexHello Contact ID** text column, and it must be shared with the Notion connection, or it won't appear. If they don't have one, have them create it. The Webhooks by Zapier catch hook needs a paid Zapier plan.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `notion` (the account that can see the contacts database) to the user's Notion connection. Webhooks by Zapier needs none.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger, if it has one, before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run each sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. The NexHello connection test must return `skipped` and run no Notion step:

```json
{
  "id": "evt_test_0001",
  "type": "webhook.test",
  "created_at": "2026-10-23T14:10:00Z",
  "data": {}
}
```

Then run this sample, which should create one row, with the name, company, lowercased email, full `https://` LinkedIn and website, and the card text in Original text:

```json
{
  "id": "evt_01JB7Q4ZK2",
  "type": "contact.activity.recorded",
  "created_at": "2026-10-23T14:12:09Z",
  "data": {
    "activity": "card_scanned",
    "contact": {
      "id": "ctc_8f3k2m9q",
      "first_name": "Maya",
      "last_name": "Lindqvist",
      "company": "Northwind Robotics",
      "job_title": "Head of Partnerships",
      "email": "Maya.Lindqvist@northwind-robotics.example",
      "phone": "+44 20 7946 0958",
      "linkedin": "linkedin.com/in/maya-lindqvist-example",
      "website": "northwind-robotics.example",
      "address": "12 Harbour Street, Bristol BS1 4XX, UK",
      "about_this_person": "Met at the Web Summit robotics meetup. Wants a demo of the fleet dashboard in November.",
      "notes": ""
    }
  },
  "raw": {
    "payload_type": "business_card",
    "payload": "NORTHWIND ROBOTICS\nMaya Lindqvist\nHead of Partnerships\nmaya.lindqvist@northwind-robotics.example\n+44 20 7946 0958\nnorthwind-robotics.example\n12 Harbour Street, Bristol BS1 4XX"
  }
}
```

Run it a second time with a different job title and a blank `about_this_person`. The same row should be updated with no second row, the job title changed, and About this person keeping its old value.

If run-status tools aren't available, check the result in Notion directly. Then publish, confirm the trigger is active, and ask the user to delete the test rows. The user deletes the test data, not the agent.

## Notes

- After publishing, copy the trigger's webhook URL and paste it into NexHello's webhook integration.
- To write more or fewer fields, change `PROPS` and the `fields` in the update step together. `NOTION_TEXT_LIMIT` trims the original text, and `EVENT_TYPE` sets the event that is accepted.
- Never commit real webhook URLs, Notion IDs, contact data or connection IDs.
