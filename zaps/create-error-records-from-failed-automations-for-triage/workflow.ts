import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  BASE_ID,
  TABLE_NAME,
  FAILURE_LINK_FIELD,
  TITLE_FIELD,
  ERROR_DETAILS_FIELD,
  NOTES_FIELD,
  STATUS_FIELD,
  ERROR_STATUS,
} from "./config.ts";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    title: z.string().nullable().optional(),
    task_history_link: z.string().nullable().optional(),
    zap_link: z.string().nullable().optional(),
    service: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
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
