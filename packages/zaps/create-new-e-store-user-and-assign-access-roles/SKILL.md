---
name: create-new-e-store-user-and-assign-access-roles
description: Build a Zapier Next Gen Zap that, when a new user intake item appears on a monday.com board, creates the customer record in your e-store platform, assigns the role chosen on the intake form, and emails the new user a temporary password and a role-specific quick start link. Use when a store or customer platform gets its users from intake forms and you want account creation, role assignment and the welcome email to happen without manual steps.
metadata:
  author: zapier
  summary: "When a new intake item lands on your board, the customer's store account is created, given the right role, and the new user gets a welcome email with a temporary password."
  apps: "monday.com, Webhooks by Zapier, Microsoft Outlook"
  category: "IT"
  job: "Identity access management"
  source: "https://zapier.com/automations/it/identity-access-management/user-provisioning/create-new-e-store-user-and-assign-access-roles"
---

# Create new e-store user and assign access roles

## What it does

1. **Trigger:** a new item is created on the intake board in monday.com (`item_created_in_board`). It reads the name, email, role selections and region.
2. **Role choice:** the first intake role that has an entry in the role table is used. If none matches, the run stops and creates nothing.
3. **Create customer record:** Webhooks by Zapier POSTs the new user to your customer platform's `/customers` endpoint, active, with a generated temporary password and a require-reset flag. The returned customer ID is kept.
4. **Assign role:** a second POST to `/customers/<id>/roles` attaches the chosen role.
5. **Onboarding email:** Microsoft Outlook sends an HTML email to the new user's address with the temporary password and the quick start link for that role.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top.

1. **Trigger:** monday.com, New Item in Board (`monday` / `item_created_in_board`). Set its `board_id` param to the ID of your intake board. The trigger needs the monday.com connection, so its `authentication_id` is that connection's ID.
2. **Connections** (each alias in the code is the app's slug):
   - `microsoft-outlook`: the Outlook account that sends the welcome email.
   - `monday`: the monday.com account that owns the intake board (trigger only).
   - Webhooks by Zapier (`webhook`) needs no connection.
3. **Constants:**
   - `CUSTOMER_API_URL`: the base URL of your customer platform API.
   - `ROLE_IDS`: intake role label → role ID in your platform. The labels here are examples (`Store Admin`, `Store Staff`).
   - `QUICK_START_URLS` and `DEFAULT_QUICK_START_URL`: the onboarding guide per role.
   - `ONBOARDING_SUBJECT`: the email subject.
   - `REQUIRE_PASSWORD_RESET`: whether the new user must change the temporary password at first sign-in.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the trigger to test against.

## Ask the user

- Which monday.com board is the intake board, and which column holds each of name, email, role selections and region?
- What is the base URL of the customer platform API, and what does its create-customer and assign-role endpoint take and return? The code expects a create response with an `id` field and a role POST that takes `role_id`.
- What are the role labels on the intake form, and the matching role IDs in the platform?
- Is there an authentication header or API key for the customer platform? The template sends none.
- Should an existing customer with the same email be reused rather than duplicated? The template always creates.
- Which quick start link goes with each role?

## Test

Before a test, use a test or integration account for every app, and point the customer platform URL at a sandbox. Then run the draft with a sample intake item like this:

```json
{
  "name": "[install-test] Sample Shopper",
  "email": "YOUR_CONNECTED_OUTLOOK_ADDRESS",
  "roles": ["Store Staff"],
  "region": "US"
}
```

Check that the customer exists in the sandbox with the role attached, that the Outlook email arrived at the connected address with the temporary password and the right quick start link, and that the run returned `customerId`, `roleLabel` and `emailed`. Then delete the sandbox customer.

## Customize

- **Role-specific onboarding templates:** the template uses one body with a per-role quick start link. Separate HTML bodies per role are a further step.
- **Notify a program coordinator or team channel on each new user,** or on a run with no matching role, for manual review.

## Notes

- Step results are journaled, so the temporary password is stored in the run history for the create-customer step. Use a platform that returns no password, or let it reset the password itself, if that matters for your setup.
- Customer records are not matched by email before creating, so re-running the same intake item creates a second customer.
- The customer platform's create response is assumed to carry an `id`. Confirm the field name on the first test.
- Never commit a real customer platform URL, role ID or email address. Anyone who can post to the platform can create store accounts.
