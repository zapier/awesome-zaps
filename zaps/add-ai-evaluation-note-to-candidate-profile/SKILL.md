---
name: add-ai-evaluation-note-to-candidate-profile
description: Build a Zapier Next Gen Zap that screens each new Greenhouse application for one job with AI by Zapier, adds the AI scorecard to the candidate's Greenhouse profile as a private note for a recruiter to review, and logs the application to a Google Sheets hiring tracker. Use when a recruiting or talent acquisition team runs Greenhouse as its ATS and wants a consistent first read of every resume and application answer before a person decides what happens next. The note never rejects, advances or ranks anyone.
license: MIT
metadata:
  author: zapier
  summary: "When someone applies to your job in Greenhouse, AI reads their resume and answers, adds a screening note to their Greenhouse profile for a recruiter to review, and logs the application in your hiring tracker sheet."
  apps: "Greenhouse, Files by Zapier, AI by Zapier, Google Sheets"
  category: "Human Resources (HR)"
  job: "Recruiting"
  source: "https://zapier.com/automations/human-resources-hr/recruiting/candidate-screening/add-ai-evaluation-note-to-candidate-profile-quickly"
---

# Add AI evaluation note to candidate profile

## What it does

1. **Trigger:** a candidate submits a new application in Greenhouse. Applications for any job other than the one you set are skipped.
2. **Greenhouse** looks up the resume attached to that application.
3. **Files by Zapier** turns the resume file into plain text. With no resume, the run carries on with the application answers alone.
4. **AI by Zapier** reads the resume text and application answers and returns a scorecard against your job criteria: experience gate (met, not met or unclear), depth score (1 to 5), product thinking score (1 to 5), a one-line overall assessment, a short summary and things to check.
5. **Greenhouse** adds the scorecard to the candidate's profile as a private note headed "AI screening notes for recruiter review. This is not a hiring decision."
6. **Google Sheets** appends a row to your hiring tracker: application ID, overall assessment, job name, link to the candidate in Greenhouse, key answer excerpts and when they applied.

The AI only describes the evidence. A recruiter reads the note and makes every decision; the zap never moves, rejects or emails a candidate.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and sample the trigger, and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** the files in this folder are the whole zap. `workflow.ts` is the workflow. It imports its settings from `config.ts` and each account from `connections/<alias>.ts`, and `triggers/` holds what starts it.

- **With the zap CLI:** `npx zap-pack add awesome-zaps/add-ai-evaluation-note-to-candidate-profile` (it makes a zap project if you aren't in one), then `npx zap-pack deploy add-ai-evaluation-note-to-candidate-profile` from that project. Deploy asks for each open setting and account, and sets the trigger.
- **With Zapier MCP:** publish every `.ts` file outside `triggers/` as `sourceFiles`, with three changes: write `config.ts` as plain values (`export const NAME = "value";`), write each `connections/<alias>.ts` as `export default "<alias>";`, and write each `@/name` import as a relative path ending in `.ts` (`./config.ts`, `./connections/<alias>.ts`). Set the trigger from the file in `triggers/`.

1. **Trigger:** Greenhouse, New Candidate Application (`greenhouse`, `candidate_v2List`). It has no settings, so it fires for every new application in the account. Set the trigger's `authentication_id` to the user's Greenhouse connection.
2. **Connections** (each alias in the code is the app's slug):
   - `greenhouse`: the user's Greenhouse connection. The trigger, the resume lookup and the note all use it, so it needs permission to list attachments and create notes.
   - `google-sheets`: the user's Google Sheets connection, for the account that owns the hiring tracker.
   - Files by Zapier and `ai` need no connection. AI by Zapier uses a managed model credential (`authentication_id: "0"`).
3. **Constants:**
   - `JOB_ID`: the Greenhouse job to screen, the number in the job's URL.
   - `JOB_NAME`: the job name written to the tracker.
   - `ROLE_CRITERIA`: the experience gate, depth and product thinking criteria the AI scores against. The default describes a payroll product manager; rewrite it for the user's role.
   - `NOTE_AUTHOR_USER_ID`: the Greenhouse user the note is created on behalf of. Pick it from the `on_behalf_of` choices on Create Candidate Note.
   - `NOTE_VISIBILITY`: `private` (default), `admin_only` or `public`. Private keeps interviewers from being primed by the AI's read.
   - `SPREADSHEET_ID`, `WORKSHEET_ID`: the tracker sheet and tab. Columns A to F must be application ID, overall assessment, job, application link, key answer excerpts, submitted at.
   - `MAX_RESUME_CHARS`, `MAX_EXCERPTS`, `MAX_EXCERPT_CHARS`: how much resume text goes to the AI and how much of the answers lands in the sheet.
   - `MODEL_ID`: the AI model tier. Defaults to `"standard/auto"`.
4. Test with the steps below, then publish and wait until the trigger is active.

## Ask the user

- Which Greenhouse job should be screened, and what does a strong candidate for it look like? Turn their answer into `ROLE_CRITERIA`.
- Who should the note be created on behalf of, and who should be able to see it?
- Which sheet and tab is the hiring tracker? Does it have the six columns in the order above?
- Has their recruiting, legal or people team agreed to AI reading applications for this role? Some places require candidates to be told.

## Test

Sample the trigger first and confirm the record carries `id`, `candidate_id`, `job_id`, `answers` and `candidate.fullName`. Then run a draft test with a test candidate's application on the chosen job, for example:

```json
{
  "id": 4100001,
  "candidate_id": 3900001,
  "job_id": 4200001,
  "created_at": "2026-11-09T15:00:00.000Z",
  "status": "in_process",
  "prospect": false,
  "answers": [
    {
      "question": "Tell us about a payroll product you owned.",
      "answer": "I led the tax filing workflow for a payroll platform used by 2,000 small businesses."
    }
  ],
  "candidate": {
    "fullName": "Sample Candidate",
    "directURL": "https://app2.greenhouse.io/people/3900001"
  }
}
```

Confirm that the test candidate's profile has one private note with the heading, both scores and the summary, and that one row landed in the tracker. Then delete the note and the row. Also run an application for another job and confirm it is skipped with nothing written.

## Customize

- **Alert on strong matches:** add a Slack or email step that posts when the experience gate is met and both scores clear a threshold you set, for a recruiter to follow up on.
- **Stricter checks for regulated roles:** swap the AI step for a custom model, or add a second check before the note is written.
- **Screen by stage:** skip applications unless they sit in a chosen interview stage (`stage_name` in the trigger record).

## Notes

- The scorecard is input for a human reviewer, not a decision. Keep the note heading, and do not add steps that reject or advance candidates from the AI's output.
- Greenhouse resume links expire, so the zap fetches a fresh one on each run instead of storing it.
- Scanned resumes without a text layer may extract as empty text; the AI then works from the answers, and the note says no resume was read only when none was attached.
- Resumes and answers are personal data. Keep the tracker sheet shared only with the hiring team, and never commit a real spreadsheet, job or user ID.
