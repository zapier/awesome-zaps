import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  JOB_ID,
  JOB_NAME,
  ROLE_CRITERIA,
  NOTE_AUTHOR_USER_ID,
  NOTE_VISIBILITY,
  SPREADSHEET_ID,
  WORKSHEET_ID,
  MODEL_ID,
} from "@/config";
import greenhouse from "@/connections/greenhouse";
import googleSheets from "@/connections/google-sheets";

const sdk = createZapierSdk();

// Resume text sent to the AI is cut to this many characters to keep the prompt and the run journal small.
const MAX_RESUME_CHARS = 20000;
// How many application answers, and how many characters of each, go into the tracker row.
const MAX_EXCERPTS = 3;
const MAX_EXCERPT_CHARS = 200;

const SCORE_OPTIONS = ["1", "2", "3", "4", "5"];

const INSTRUCTIONS = `You prepare screening notes that a human recruiter reads before deciding what to do with an application. You never decide, recommend rejecting, or recommend hiring. A person makes every hiring decision.

Score the application only against these job criteria:
${ROLE_CRITERIA}

Use only the evidence in the supplied resume text and application answers. Ignore the candidate's name, age, gender, ethnicity, nationality, disability, family status, photos, school prestige and employment gaps, and never guess at them. If the resume text is empty, say so and score from the answers alone.

Return:
- experience_gate: whether the evidence shows the experience gate is met.
- depth_score: 1 (little evidence) to 5 (strong evidence) for depth.
- product_thinking_score: 1 to 5 for product thinking.
- overall_assessment: one short line a recruiter can scan, such as "Strong evidence on all criteria" or "Gate unclear, check payroll experience". Describe the evidence, never a decision.
- summary: three to five sentences on what the evidence shows, quoting the resume or answers where it helps.
- red_flags: specific gaps or inconsistencies the recruiter should check, or "None noted".`;

const ApplicationSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    candidate_id: z.union([z.string(), z.number()]),
    job_id: z.union([z.string(), z.number()]).nullable().optional(),
    created_at: z.string().nullable().optional(),
    answers: z
      .array(
        z
          .object({
            question: z.string().nullable().optional(),
            answer: z.string().nullable().optional(),
          })
          .loose(),
      )
      .nullable()
      .optional(),
    candidate: z
      .object({
        fullName: z.string().nullable().optional(),
        directURL: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

const AttachmentSchema = z
  .object({ type: z.string(), url: z.string() })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "add-ai-evaluation-note-to-candidate-profile",
  async (ctx, rawInput) => {
    const input = ApplicationSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const applicationId = String(input.id);
    const candidateId = String(input.candidate_id);

    if (String(input.job_id ?? "") !== JOB_ID) {
      return { skipped: true, reason: "other-job", applicationId };
    }

    const candidateName =
      input.candidate?.fullName ?? `Candidate ${candidateId}`;
    const applicationLink =
      input.candidate?.directURL ??
      `https://app2.greenhouse.io/people/${candidateId}?application_id=${applicationId}`;
    const answers = (input.answers ?? []).filter((item) => item.answer);
    const answersText = answers
      .map((item) => `Q: ${item.question ?? ""}\nA: ${item.answer ?? ""}`)
      .join("\n\n");

    const resumeUrl = await ctx.step(
      `find-resume-${applicationId}`,
      async () => {
        const response = await sdk.fetch(
          `https://harvest.greenhouse.io/v3/attachments?application_ids=${applicationId}&type=resume`,
          { connection: greenhouse, method: "GET" },
        );
        if (!response.ok) {
          throw new Error(`Greenhouse returned ${response.status}`);
        }
        const attachments = z
          .array(AttachmentSchema)
          .parse(await response.json());
        return attachments.find((item) => item.type === "resume")?.url ?? null;
      },
    );

    const resumeText = resumeUrl
      ? await ctx.step(`extract-resume-text-${applicationId}`, async () => {
          const extracted = await sdk.runAction({
            appKey: "files-by-zapier",
            actionType: "write",
            actionKey: "text_from_file_new",
            inputs: { file: resumeUrl },
          });
          const text = (extracted.data[0] as { text?: string } | undefined)
            ?.text;
          return (text ?? "").slice(0, MAX_RESUME_CHARS);
        })
      : "";

    const scorecard = await ctx.step(
      `score-application-${applicationId}`,
      async () =>
        sdk.runAction({
          appKey: "ai",
          actionType: "write",
          actionKey: "get_completion",
          inputs: {
            model_id: MODEL_ID,
            authentication_id: "0",
            instructions: INSTRUCTIONS,
            inputFields: {
              candidate_name: candidateName,
              application_answers: answersText,
              resume_text: resumeText,
            },
            includeWorkflowData: false,
            outputFields: [
              {
                name: "experience_gate",
                type: "category_single",
                options: ["Met", "Not met", "Unclear"],
                isRequired: true,
              },
              {
                name: "depth_score",
                type: "category_single",
                options: SCORE_OPTIONS,
                isRequired: true,
              },
              {
                name: "product_thinking_score",
                type: "category_single",
                options: SCORE_OPTIONS,
                isRequired: true,
              },
              { name: "overall_assessment", type: "text", isRequired: true },
              { name: "summary", type: "text", isRequired: true },
              { name: "red_flags", type: "text", isRequired: true },
            ],
          },
        }),
    );

    const result = (scorecard.data[0] ?? {}) as Record<string, unknown>;
    const field = (name: string) => String(result[name] ?? "").trim();
    const overallAssessment = field("overall_assessment");

    const noteBody = [
      "AI screening notes for recruiter review. This is not a hiring decision.",
      "",
      `Experience gate: ${field("experience_gate")}`,
      `Depth: ${field("depth_score")} of 5`,
      `Product thinking: ${field("product_thinking_score")} of 5`,
      `Overall: ${overallAssessment}`,
      "",
      `Summary: ${field("summary")}`,
      "",
      `Check: ${field("red_flags")}`,
      ...(resumeUrl
        ? []
        : [
            "",
            "No resume was attached, so this is based on the application answers only.",
          ]),
    ].join("\n");

    await ctx.step(`add-greenhouse-note-${applicationId}`, async () =>
      sdk.runAction({
        appKey: "greenhouse",
        actionType: "write",
        actionKey: "candidate_note_v2",
        connection: greenhouse,
        inputs: {
          candidate: candidateId,
          body: noteBody,
          visibility: NOTE_VISIBILITY,
          on_behalf_of: NOTE_AUTHOR_USER_ID,
        },
      }),
    );

    const excerpts = answers
      .slice(0, MAX_EXCERPTS)
      .map(
        (item) =>
          `${item.question ?? ""}: ${(item.answer ?? "").slice(0, MAX_EXCERPT_CHARS)}`,
      )
      .join(" | ");

    await ctx.step(`log-tracker-row-${applicationId}`, async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: googleSheets,
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          COL$A: applicationId,
          COL$B: overallAssessment,
          COL$C: JOB_NAME,
          COL$D: applicationLink,
          COL$E: excerpts,
          COL$F: input.created_at ?? "",
        },
      }),
    );

    return {
      applicationId,
      candidateId,
      hadResume: Boolean(resumeUrl),
      experienceGate: field("experience_gate"),
      overallAssessment,
    };
  },
);

export default workflow;
