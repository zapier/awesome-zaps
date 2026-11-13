---
name: add-ai-evaluation-note-to-candidate-profile
description: Build a Zap on Zapier that screens each new Greenhouse application for one job with AI by Zapier, adds the AI scorecard to the candidate's Greenhouse profile as a private note for a recruiter to review, and logs the application to a Google Sheets hiring tracker. Use when a recruiting team runs Greenhouse and wants a consistent first read of every application before a person decides. The note never rejects, advances or ranks anyone.
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

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-ai-evaluation-note-to-candidate-profile. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new application in Greenhouse (`greenhouse`, `candidate_v2List`, no settings). Applications for any job other than `JOB_ID` are skipped.
2. **Greenhouse** looks up the resume attached to the application.
3. **Files by Zapier** turns the resume into plain text. With no resume, the run carries on with the answers alone.
4. **AI by Zapier** scores the resume and answers against `ROLE_CRITERIA`: experience gate (met, not met, unclear), depth (1 to 5), product thinking (1 to 5), a one-line assessment, a summary and things to check.
5. **Greenhouse** adds the scorecard to the candidate as a note headed "AI screening notes for recruiter review. This is not a hiring decision."
6. **Google Sheets** appends a row to the hiring tracker: application ID, assessment, job, candidate link, answer excerpts, submitted at.

The AI only describes the evidence. A recruiter makes every decision; the Zap never moves, rejects or emails a candidate.

## Ask the user

Each `REPLACE_…` value in `config.ts` is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting               | What goes there                                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `JOB_ID`              | The Greenhouse job to screen: the number in the job's URL                                                                                           |
| `JOB_NAME`            | That job's name as shown in Greenhouse; look it up from `JOB_ID` so the two always match                                                            |
| `NOTE_AUTHOR_USER_ID` | The Greenhouse user the note is created on behalf of: pick from `on_behalf_of` on Create Candidate Note                                             |
| `SPREADSHEET_ID`      | The hiring tracker spreadsheet. Columns A to F must be application ID, overall assessment, job, application link, key answer excerpts, submitted at |

Also review the defaults with them: `ROLE_CRITERIA` (written for a payroll product manager: rewrite it from what they say a strong candidate looks like), `NOTE_VISIBILITY` (`private`, `admin_only` or `public`), `WORKSHEET_ID` (`"0"` is the first tab) and `MODEL_ID`.

Before turning it on, confirm their recruiting, legal or people team has agreed to AI reading applications for this role. Some places require candidates to be told.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `greenhouse` (needs permission to list attachments and create notes) and `google-sheets` (the account that owns the tracker) to the user's connections. Files by Zapier and AI by Zapier need none.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/candidate-v2-list.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a test candidate's application on the chosen job:

```json
{
  "id": 4100001,
  "candidate_id": 3900001,
  "job_id": 4200001,
  "created_at": "2026-11-09T15:00:00.000Z",
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

Check that the candidate has one note with the heading, both scores and the summary, and that one row landed in the tracker. If run-status tools aren't available, check Greenhouse and the sheet directly. Then ask the user to delete both. An application for another job should be skipped with nothing written. Publish only after the test passes, and confirm the trigger is active.

## Notes

- The note is input for a reviewer, not a decision. Keep its heading, and don't add steps that reject or advance candidates from the AI's output.
- Greenhouse resume links expire, so the Zap fetches a fresh one on each run.
- Resumes and answers are personal data. Share the tracker only with the hiring team, and never commit a real spreadsheet, job or user ID.
- To extend it: alert on strong matches in Slack, add a second check for regulated roles, or screen only a chosen stage (`stage_name` in the trigger record).
