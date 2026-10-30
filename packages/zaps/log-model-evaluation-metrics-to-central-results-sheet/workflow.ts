import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Name of the canonical targets JSON file in Google Drive (the first match is used).
const TARGETS_FILE_NAME = "YOUR_TARGETS_FILE_NAME";
// Google Sheets spreadsheet ID (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Sheet columns for each recorded field.
const BATCH_ID_COLUMN = "COL$A";
const SUBMITTED_AT_COLUMN = "COL$B";
const WORKSHOP_COLUMN = "COL$C";
const TEAM_COLUMN = "COL$D";
const TOTAL_RMSE_COLUMN = "COL$E";
const HIGH_ERROR_RMSE_COLUMN = "COL$F";
const PROFIT_ESTIMATE_COLUMN = "COL$G";
// Absolute prediction errors at or above this value count toward the high-error RMSE.
const HIGH_ERROR_THRESHOLD = 1.0;

const PredictionSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    predicted: z.number(),
  })
  .loose();

const InputSchema = z
  .object({
    batch_id: z.union([z.string(), z.number()]).nullable().optional(),
    submitted_at: z.string().nullable().optional(),
    workshop: z.string(),
    team: z.string().nullable().optional(),
    predictions: z.array(PredictionSchema),
    profit_estimate: z.union([z.number(), z.string()]).nullable().optional(),
  })
  .loose();

const rmse = (values: number[]) =>
  Math.sqrt(
    values.reduce((sum, value) => sum + value * value, 0) / values.length,
  );

const workflow = defineDurable<unknown, unknown>(
  "log-model-evaluation-metrics-to-central-results-sheet",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const batchId = String(input.batch_id ?? "");

    const targetsFile = await ctx.step("find-targets-file", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "search",
        actionKey: "file_v2",
        connection: "google-drive",
        inputs: { title: TARGETS_FILE_NAME, search_type: "exact" },
      }),
    );

    const fileId = targetsFile.data?.[0]?.id;
    if (!fileId) {
      return { skipped: true, reason: "targets-file-not-found", batchId };
    }

    const download = await ctx.step("download-targets-file", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "write",
        actionKey: "ae_461284_google_drive_download_file_custom_action",
        connection: "google-drive",
        inputs: { fileId: String(fileId) },
      }),
    );

    // Targets JSON: { "<workshop selector>": [{ "id": ..., "actual": number }, ...] }
    const targets = JSON.parse(
      Buffer.from(String(download.data?.[0]?.content ?? ""), "base64").toString(
        "utf8",
      ),
    ) as Record<string, { id: string | number; actual: number }[]>;

    const window = targets[input.workshop];
    if (!Array.isArray(window)) {
      return {
        skipped: true,
        reason: "no-targets-for-workshop",
        batchId,
        workshop: input.workshop,
      };
    }

    const actualById = new Map(
      window.map((t) => [String(t.id), Number(t.actual)]),
    );
    const errors = input.predictions.flatMap((p) => {
      const actual = actualById.get(String(p.id));
      return actual === undefined || !Number.isFinite(actual)
        ? []
        : [p.predicted - actual];
    });

    const totalRmse = errors.length ? rmse(errors) : NaN;
    if (!Number.isFinite(totalRmse)) {
      return {
        skipped: true,
        reason: "no-valid-evaluations",
        batchId,
        workshop: input.workshop,
      };
    }

    const highErrors = errors.filter(
      (e) => Math.abs(e) >= HIGH_ERROR_THRESHOLD,
    );
    const highErrorRmse = highErrors.length ? rmse(highErrors) : 0;

    const row = await ctx.step("record-evaluation-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          [BATCH_ID_COLUMN]: batchId,
          [SUBMITTED_AT_COLUMN]: input.submitted_at ?? "",
          [WORKSHOP_COLUMN]: input.workshop,
          [TEAM_COLUMN]: input.team ?? "",
          [TOTAL_RMSE_COLUMN]: String(totalRmse),
          [HIGH_ERROR_RMSE_COLUMN]: String(highErrorRmse),
          [PROFIT_ESTIMATE_COLUMN]: String(input.profit_estimate ?? ""),
        },
      }),
    );

    return {
      batchId,
      workshop: input.workshop,
      totalRmse,
      highErrorRmse,
      evaluated: errors.length,
      row: row.data?.[0] ?? null,
    };
  },
);

export default workflow;
