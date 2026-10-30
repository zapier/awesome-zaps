import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Source spreadsheet ID the trigger watches (the long ID in the sheet's URL). Set on the trigger.
const SOURCE_SPREADSHEET_ID = "YOUR_SOURCE_SPREADSHEET_ID";
// Worksheet (tab) the trigger watches; the first tab is "0". Set on the trigger.
const SOURCE_WORKSHEET_ID = "0";
// Master spreadsheet ID that receives the cleaned rows.
const MASTER_SPREADSHEET_ID = "YOUR_MASTER_SPREADSHEET_ID";
// Worksheet (tab) in the master spreadsheet; the first tab is "0".
const MASTER_WORKSHEET_ID = "0";
// The six dispositions a row may be normalized to. Replace with your own labels.
const ALLOWED_DISPOSITIONS = [
  "Interested",
  "Not interested",
  "Callback requested",
  "Do not contact",
  "No answer",
  "Wrong number",
];
// Written to the master row when the text matches none of the allowed dispositions.
const REVIEW_DISPOSITION = "Needs review";
// AI by Zapier model tier. Prompt-only, so no tool-capable model is needed.
const MODEL_ID = "standard/auto";

const INSTRUCTIONS = `Classify the supplied disposition note into exactly one of these labels: ${ALLOWED_DISPOSITIONS.join(", ")}. Reply with only the label, copied exactly as written. If no label fits, reply with exactly: NO MATCH. Do not add any other text.`;

const InputSchema = z
  .object({
    row: z.union([z.string(), z.number()]).nullable().optional(),
    COL$A: z.string().nullable().optional(),
    COL$B: z.string().nullable().optional(),
    COL$C: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-clean-disposition-rows-in-master-sheet-fast",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const rawDisposition = (input.COL$B ?? "").trim();
    if (!rawDisposition) {
      return {
        skipped: true,
        reason: "empty-disposition",
        row: input.row ?? null,
      };
    }

    const completion = await ctx.step("normalize-disposition", async () =>
      sdk.runAction({
        appKey: "ai",
        actionType: "write",
        actionKey: "get_completion",
        inputs: {
          model_id: MODEL_ID,
          authentication_id: "0",
          instructions: INSTRUCTIONS,
          inputFields: { disposition: rawDisposition },
          includeWorkflowData: false,
          outputFields: [
            { name: "disposition", type: "text", isRequired: true },
          ],
        },
      }),
    );

    const answer = String(completion.data[0]?.disposition ?? "").trim();
    const match = ALLOWED_DISPOSITIONS.find(
      (label) => label.toLowerCase() === answer.toLowerCase(),
    );
    const disposition = match ?? REVIEW_DISPOSITION;
    const needsReview = match ? "" : "yes";

    const importedAt = await ctx.step("capture-imported-at", async () =>
      new Date().toISOString(),
    );

    const master = await ctx.step("create-master-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: MASTER_SPREADSHEET_ID,
          worksheet: MASTER_WORKSHEET_ID,
          COL$A: input.COL$A ?? "",
          COL$B: disposition,
          COL$C: rawDisposition,
          COL$D: needsReview,
          COL$E: input.COL$C ?? "",
          COL$F: importedAt,
        },
      }),
    );

    return {
      row: input.row ?? null,
      disposition,
      needsReview: needsReview === "yes",
      importedAt,
      created: master.data[0] ?? null,
    };
  },
);

export default workflow;
