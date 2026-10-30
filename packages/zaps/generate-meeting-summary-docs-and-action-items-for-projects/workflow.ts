import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Drive folder ID for the new doc. "root" puts it at the top level of My Drive.
const DOC_FOLDER = "root";
// Seconds to wait after the tracker row is written, before the AI steps read it.
const SETTLE_SECONDS = 120;
// Model for both AI steps. "premium/auto" is Zapier's managed default.
const AI_MODEL = "premium/auto";

const RecordSchema = z
  .object({
    id: z.string().nullable().optional(),
    data: z
      .object({
        f1: z.string().nullable().optional(), // Title
        f2: z.string().nullable().optional(), // Date
        f3: z.string().nullable().optional(), // Transcript
        f4: z.string().nullable().optional(), // Gist
        f5: z.string().nullable().optional(), // Overview
        f6: z.string().nullable().optional(), // Notes
        f7: z.string().nullable().optional(), // Action Items
        f8: z.string().nullable().optional(), // Company Summary
      })
      .loose(),
  })
  .loose();

const InputSchema = z.object({ new: RecordSchema }).loose();

const workflow = defineDurable<unknown, unknown>(
  "generate-meeting-summary-docs-and-action-items-for-projects",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const row = input.new.data;
    const transcript = (row.f3 ?? "").trim();
    if (!transcript) {
      return {
        skipped: true,
        reason: "no-transcript",
        recordId: input.new.id ?? null,
      };
    }

    const title = (row.f1 ?? "Untitled meeting").trim();
    const meetingDay = row.f2 ? row.f2.slice(0, 10) : "undated";
    const docTitle = `${title} - ${meetingDay}`;

    await ctx.wait("wait-for-source-writes", SETTLE_SECONDS);

    const analysisResult = await ctx.step(
      "analyze-meeting-transcript",
      async () =>
        sdk.runAction({
          appKey: "ai",
          actionType: "write",
          actionKey: "get_completion",
          inputs: {
            model_id: AI_MODEL,
            authentication_id: "0",
            includeWorkflowData: false,
            instructions:
              "From the meeting transcript, extract: decisions (bulleted list of what was decided), action_items (owner, task and due date if stated), key_quotes (up to five exact quotes), status (one line on where the work stands), problems (blockers and risks), and follow_ups (who follows up on what). Use only what the transcript says. Write 'None stated' for any field with no content. Do not invent names or dates.",
            inputFields: { transcript },
            outputFields: [
              { name: "decisions", type: "text", isRequired: true },
              { name: "action_items", type: "text", isRequired: true },
              { name: "key_quotes", type: "text", isRequired: true },
              { name: "status", type: "text", isRequired: true },
              { name: "problems", type: "text", isRequired: true },
              { name: "follow_ups", type: "text", isRequired: true },
            ],
          },
        }),
    );
    const analysis = analysisResult.data[0];

    const companyText = [row.f8, row.f4, row.f5]
      .map((part) => (part ?? "").trim())
      .filter(Boolean)
      .join("\n\n");

    const companyResult = await ctx.step("categorize-companies", async () =>
      sdk.runAction({
        appKey: "ai",
        actionType: "write",
        actionKey: "get_completion",
        inputs: {
          model_id: AI_MODEL,
          authentication_id: "0",
          includeWorkflowData: false,
          instructions:
            "From the company text, sort every company named into exactly one list: primary (the main subject of the meeting), secondary (discussed in depth but not the main subject), mentioned (named only in passing), or other (anything that does not fit). Give comma-separated company names for each list, using the names as written, and 'None' for an empty list. Do not invent companies.",
          inputFields: { company_text: companyText || "(none)" },
          outputFields: [
            { name: "primary", type: "text", isRequired: true },
            { name: "secondary", type: "text", isRequired: true },
            { name: "mentioned", type: "text", isRequired: true },
            { name: "other", type: "text", isRequired: true },
          ],
        },
      }),
    );
    const companies = companyResult.data[0];

    const sections: [string, string | null | undefined][] = [
      ["Gist", row.f4],
      ["Overview", row.f5],
      ["Notes", row.f6],
      ["Action items (tracker)", row.f7],
      ["AI analysis: decisions", analysis?.decisions],
      ["AI analysis: action items", analysis?.action_items],
      ["AI analysis: key quotes", analysis?.key_quotes],
      ["AI analysis: status", analysis?.status],
      ["AI analysis: problems", analysis?.problems],
      ["AI analysis: follow-ups", analysis?.follow_ups],
      ["Companies: primary", companies?.primary],
      ["Companies: secondary", companies?.secondary],
      ["Companies: mentioned", companies?.mentioned],
      ["Companies: other", companies?.other],
    ];
    const body = [
      `Meeting: ${title}`,
      `Date: ${meetingDay}`,
      ...sections.flatMap(([heading, text]) => [
        "",
        heading,
        (text ?? "").trim() || "(none)",
      ]),
    ].join("\n");

    const doc = await ctx.step("create-meeting-summary-doc", async () =>
      sdk.runAction({
        appKey: "google-docs",
        actionType: "write",
        actionKey: "newtxtdocument",
        connection: "google-docs",
        inputs: {
          title: docTitle,
          file: body,
          folder: DOC_FOLDER,
        },
      }),
    );

    return {
      recordId: input.new.id ?? null,
      docTitle,
      doc: doc.data[0] ?? null,
    };
  },
);

export default workflow;
