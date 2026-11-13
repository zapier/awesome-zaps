---
name: create-new-e-store-user-and-assign-access-roles
description: Build a Zap on Zapier that, when a new user intake item appears on a monday.com board, creates the customer record in your e-store platform, assigns the role chosen on the intake form, and emails the new user a temporary password and a role-specific quick start link. Use when a store or customer platform gets its users from intake forms and you want account creation, role assignment and the welcome email to happen without manual steps.
license: MIT
metadata:
  author: zapier
  summary: "When a new intake item lands on your board, the customer's store account is created, given the right role, and the new user gets a welcome email with a temporary password."
  apps: "monday.com, Webhooks by Zapier, Microsoft Outlook"
  category: "IT"
  job: "Identity access management"
  source: "https://zapier.com/automations/it/identity-access-management/user-provisioning/create-new-e-store-user-and-assign-access-roles"
---

# Create new e-store user and assign access roles

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-new-e-store-user-and-assign-access-roles. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new item is created on the intake board in monday.com (`monday`, `item_created_in_board`). It reads the name, email, role selections and region.
2. **Role choice:** the first intake role that has an entry in the role table is used. If none matches, the run stops and creates nothing.
3. **Create customer record:** Webhooks by Zapier POSTs the new user to the customer platform's `/customers` endpoint, active, with a generated temporary password and a require-reset flag. The returned customer ID is kept.
4. **Assign role:** a second POST to `/customers/<id>/roles` attaches the chosen role.
5. **Onboarding email:** Microsoft Outlook sends an HTML email to the new user's address with the temporary password and the quick start link for that role.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                           | Where                                           | What goes there                                                             |
| --------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| `REPLACE_INTAKE_BOARD_ID`         | `triggers/item-created-in-board.ts`, `board_id` | The monday.com board that gets the intake items, looked up from its name    |
| `REPLACE_CUSTOMER_API_URL`        | `config.ts`                                     | The base URL of the customer platform API, without a trailing slash         |
| `REPLACE_STORE_ADMIN_ROLE_ID`     | `workflow.ts`, `ROLE_IDS`                       | The customer platform's ID for the role the form's Store Admin choice gives |
| `REPLACE_STORE_STAFF_ROLE_ID`     | `workflow.ts`, `ROLE_IDS`                       | The customer platform's ID for the role the form's Store Staff choice gives |
| `REPLACE_DEFAULT_QUICK_START_URL` | `config.ts`                                     | The onboarding guide for any role without its own link                      |
| `REPLACE_ADMIN_QUICK_START_URL`   | `workflow.ts`, `QUICK_START_URLS`               | The onboarding guide for Store Admin                                        |
| `REPLACE_STAFF_QUICK_START_URL`   | `workflow.ts`, `QUICK_START_URLS`               | The onboarding guide for Store Staff                                        |

Also review the defaults with them: the role labels `Store Admin` and `Store Staff` in `workflow.ts` must match the intake form's labels exactly, `ONBOARDING_SUBJECT` in `config.ts` is the email subject, and `REQUIRE_PASSWORD_RESET` in `workflow.ts` decides whether the new user must change the temporary password at first sign-in.

Before building, ask two questions: does the customer platform need an authentication header or API key (the template sends none, so add one first if it does), and does its create response return the new customer's `id` while its role endpoint takes `role_id`? The code expects both.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `microsoft-outlook` (the Outlook account that sends the welcome email) and `monday` (the account that owns the intake board, for the trigger only) to the user's connections. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/item-created-in-board.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the monday.com trigger's fields (the name, email, role selections and region columns) and the Outlook send-email fields with the user's connections, sample the trigger, and fix any key in `workflow.ts` that doesn't match.

## Test it

Before a test, use a test or integration account for every app, and point the customer platform URL at a sandbox. Then run the draft with a sample intake item like this:

```json
{
  "name": "[install-test] Sample Shopper",
  "email": "test.shopper@example.com",
  "roles": ["Store Staff"],
  "region": "US"
}
```

Put an address you control in place of the sample address, so the welcome email arrives. Check that the customer exists in the sandbox with the role attached, that the Outlook email arrived at that address with the temporary password and the right quick start link, and that the run returned `customerId`, `roleLabel` and `emailed`. If run-status tools aren't available, check the customer platform directly. Then publish, confirm the trigger is active, and ask the user to delete the sandbox customer and the test email; the agent doesn't delete test data.

## Notes

- Step results are journaled, so the temporary password is stored in the run history for the create-customer step. Use a platform that returns no password, or let it reset the password itself, if that matters for your setup.
- Customer records are not matched by email before creating, so re-running the same intake item creates a second customer. Reuse an existing customer by email if that matters.
- To extend it: separate onboarding HTML per role, or notify a program coordinator or team channel on each new user, or on a run with no matching role, for manual review.
- Never commit a real customer platform URL, role ID or email address. Anyone who can post to the platform can create store accounts.
