import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Airtable base ID (starts with "app"), from the base's URL.
const BASE_ID = "YOUR_BASE_ID";
// Airtable table where error records are kept.
const TABLE_NAME = "YOUR_TABLE_NAME";
// Field holding the failure link. Used to find an existing record for the same failure.
const FAILURE_LINK_FIELD = "Failure link";
// Field for the alert title (the Zap's name).
const TITLE_FIELD = "Title";
// Field for the error details (app and message).
const ERROR_DETAILS_FIELD = "Error details";
// Field for the latest error notes, overwritten when the same failure repeats.
const NOTES_FIELD = "Notes";
// Field for triage status.
const STATUS_FIELD = "Status";
// Status written to every error record for manual triage.
const ERROR_STATUS = "Error";

const InputSchema = z
  .object({
    title: z.string().nullable().optional(),
    task_history_link: z.string().nullable().optional(),
    zap_link: z.string().nullable().optional(),
    service: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-error-records-from-failed-automations-for-triage",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const failureLink = input.task_history_link ?? input.zap_link ?? null;
    if (!failureLink) {
      return { skipped: true, reason: "no-failure-link" };
    }

    const title = input.title ?? "Untitled Zap";
    const errorDetails = `${input.service ?? "Unknown app"}: ${input.message ?? "No error message"}`;

    const existing = await ctx.step("find-error-record", async () =>
      sdk.runAction({
        appKey: "airtable",
        actionType: "search",
        actionKey: "findRecord",
        connection: "airtable",
        inputs: {
          applicationId: BASE_ID,
          tableName: TABLE_NAME,
          searchByField: FAILURE_LINK_FIELD,
          searchByValue: failureLink,
          isExactMatch: true,
        },
      }),
    );

    const match = existing.data?.[0] as { id?: string } | undefined;

    if (match?.id) {
      const updated = await ctx.step("update-error-record", async () =>
        sdk.runAction({
          appKey: "airtable",
          actionType: "write",
          actionKey: "updateRecord",
          connection: "airtable",
          inputs: {
            applicationId: BASE_ID,
            tableName: TABLE_NAME,
            rowId: match.id,
            [TITLE_FIELD]: title,
            [NOTES_FIELD]: errorDetails,
            [STATUS_FIELD]: ERROR_STATUS,
          },
        }),
      );
      return {
        action: "updated",
        recordId: match.id,
        updated: updated.data?.[0] ?? null,
      };
    }

    const created = await ctx.step("create-error-record", async () =>
      sdk.runAction({
        appKey: "airtable",
        actionType: "write",
        actionKey: "createRecord",
        connection: "airtable",
        inputs: {
          applicationId: BASE_ID,
          tableName: TABLE_NAME,
          [TITLE_FIELD]: title,
          [FAILURE_LINK_FIELD]: failureLink,
          [ERROR_DETAILS_FIELD]: errorDetails,
          [STATUS_FIELD]: ERROR_STATUS,
        },
      }),
    );

    return { action: "created", record: created.data?.[0] ?? null };
  },
);

export default workflow;
