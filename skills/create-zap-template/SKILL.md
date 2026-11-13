---
name: create-zap-template
description: Use when the user asks to turn a zapier.com automation page, or a Zap they already run, into a Zap template for github.com/zapier/awesome-zaps, or to "make a template out of" a Zap or recipe. Writes one plain-file zap folder (workflow.ts, config.ts, connections/, triggers/, SKILL.md, README.md), tests it with a Zapier MCP draft run without turning it on, and hands back the folder for a pull request.
license: MIT
metadata:
  author: zapier
---

# Create a Zap template

One source in, one zap folder out, ready for a pull request to [zapier/awesome-zaps](https://github.com/zapier/awesome-zaps). Anyone can then install it by telling their agent "Build me this Zap, read how here: <folder link>".

## Before you start

- **Zapier MCP** connected in this session. Without it, stop and tell the user.
- **A local clone of awesome-zaps.** Read its `AGENTS.md` (the Workflows and Documentation sections) and `CONTRIBUTING.md` first. They own the format and win wherever this skill disagrees.
- **Examples:** the zaps in `zaps/`. Read a few, including one that uses the same apps if there is one.

## 1. Get the source

**From a zapier.com automation page:** every page under `zapier.com/automations/...` has a Markdown build recipe at the same URL plus `.md` (`curl -sL "<page-url>.md"`). Build only its spec; its Customize section becomes Notes in the SKILL.md, not code. `zapier.com/templates/...` pages have no recipe: find the matching `zapier.com/automations` page, or ask the user to pick one that has it.

**From a Zap the user already runs:** read it from their account. A workflow: `get_workflow`, and take `workflow.ts`, the trigger and the connections from its current version. A classic Zap: ask the user for its editor link, then `import_zap_to_workflow` with `private: true` and read the converted draft. Every ID in it belongs to the user; step 3 replaces each one.

Name the folder after what the Zap does, in kebab-case without filler words: "Update missed appointment rows in your tracking sheet" becomes `update-missed-appointment-rows`. Check `zaps/<slug>/` doesn't exist yet.

## 2. Pick connections for testing

List the user's connections for each app (`list_zapier_connections`). Pick, in order:

1. A test or integration account: its title mentions test, testing, integration, sandbox, QA, dev or demo.
2. Otherwise the user's Zapier work account, never a personal one.

If an app has no connection, write the zap anyway and report it as built but not run.

## 3. Write the zap

Write it to `zaps/<slug>/`, in the same shape as the examples, following `AGENTS.md`. The points agents most often get wrong:

- **`workflow.ts`:** `defineDurable("<slug>", …)` with the folder name. It imports only `@zapier/zapier-durable`, `@zapier/zapier-sdk`, `zod` and `./config.ts`. Name each account by its alias as a string (`connection: "google-sheets"`). Keep `appKey`, `actionType` and `actionKey` string literals; Zapier's publish check rejects anything else. Check each action's keys and fields with `inspect_zapier_actions` before writing them.
- **`config.ts`:** every value that differs per person is `"REPLACE_<NAME>"`, first in the file, with a same-line comment that starts with how to get it ("Ask the user…", "Look up with the user's … connection…"). Values the same for everyone are plain strings below. Never write a real ID, email address or webhook URL anywhere in the folder.
- **`connections/<alias>.ts`:** `export default { app, description }`, one per account. The alias is the app's slug (`google-sheets`, `slack`), never its implementation key. Never add an `id`.
- **`triggers/<event>.ts`:** a plain object with `app`, `event`, `connection` (the alias) and `params`. Check the event and field keys with `get_trigger_fields` first. A per-person trigger setting is a `"REPLACE_…"` value with the same kind of comment; a value also in `config.ts` uses the same `REPLACE_` name in both. A Zap that runs only on demand has no `triggers/` folder.
- **`SKILL.md`:** frontmatter `name: <slug>`, a `description` that says when to use it, `license: MIT`, and under `metadata`: `author`, a one-sentence `summary`, `apps` (only the apps it uses), `category`, `job`, and `source` when it came from a zapier.com page. Then these sections: the link to the folder on GitHub, What it does, Ask the user (a table of every `REPLACE_` value and where it lives), Build it, Test it (a sample input with no real data), Notes. Never say whether or how the zap was tested in the file; that goes in your report.
- **`README.md`:** the summary, the apps, a "Based on" link when there's a source page, the Install section with "Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/<slug>", and the file list.

Run `pnpm check` from the repo root before testing. Its catalog test checks the folder, including that nothing personal leaked into it.

## 4. Test it

**Ask the user before the first test** and name the account it will touch. A draft run has real side effects. If they say no, use build-only mode.

### Safety rules

A draft run does real things in the user's apps.

- **Test data only.** Name everything you create "[install-test] …", and never edit or delete anything you didn't create.
- **Send only to the user.** Email or SMS goes only to the connected account's own address or number. Post only to a test channel the user owns, with no @-mentions.
- **No live business data.** On CRM, finance, payment, HR or e-commerce apps, test only on a sandbox or test account; otherwise use build-only mode.
- **Never publish.** Test the draft and stop, so no trigger goes live.

### Tested mode

1. Load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it up to the draft test, not past it.
2. Create the workflow named "[install-test] <title>" (private), then a draft with `workflow.ts` and `config.ts` holding the test values (never write them back into the repo), the connections bound to the test accounts, and the trigger from `triggers/`.
3. Run the draft (`run_workflow_draft`) with the SKILL.md's sample input, at most **three** times, and only to find and fix bugs. Fix the file in `zaps/<slug>/`, update the draft, run again.
4. Confirm the effect after the last run in the destination app: the row read back, the email seen, the message posted. If run-status tools are disabled, this check is the test.
5. Leave the draft unpublished, and tell the user which "[install-test]" workflow to delete.

If a run is rate-limited, stop testing and report the zap as built but not run. Don't wait it out mid-conversion.

### Build-only mode

Run nothing and send nothing. Check the trigger and every action against their real fields with the connection you would use (`get_trigger_fields`, `inspect_zapier_actions`), and make every key and value in the files match them. Run `pnpm check`.

## 5. Hand back

1. `git status` shows only `zaps/<slug>/`, with no real values in it. `pnpm check` passes.
2. Tell the user:
   - **Status:** tested and passed, built but not run (and why), or failed (and what broke).
   - The "[install-test]" workflow's ID, and that it was never published.
   - Which connection each app used, and whether it was a test account.
   - Each value you chose where the source said to ask the user.
   - Anything in the source you couldn't build faithfully.
   - Every "[install-test]" resource you created, with its ID, so the user can clean up.
3. Don't commit, push or open a pull request until the user asks.
