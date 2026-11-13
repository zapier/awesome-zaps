import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_NAME,
  PERMALINK_FIELD,
  STATUS_FIELD,
  TITLE_FIELD,
  OWNER_FIELD,
} from "./config.ts";

const sdk = createZapierSdk();

const TaskSchema = z
  .object({
    url: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    assignee: z.string().nullable().optional(),
  })
  .loose();

const RecordSchema = z
  .object({
    id: z.string(),
  })
  .loose();

const workflow = defineDurable(
  "update-experiment-record-status-from-task-changes",
  async (ctx, rawInput) => {
    const task = TaskSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const permalink = task.url ?? "";
    if (!permalink) {
      return { skipped: true, reason: "no-task-permalink" };
    }
    const title = task.name ?? "";
    const owner = task.assignee ?? "";
    const status = task.status ?? "";

    const lookup = await ctx.step("find-experiment-record", async () =>
      sdk.runAction({
        appKey: "airtable",
        actionType: "search",
        actionKey: "findRecord",
        connection: "airtable",
        inputs: {
          applicationId: AIRTABLE_BASE_ID,
          tableName: AIRTABLE_TABLE_NAME,
          isExactMatch: "true",
          searchByField: PERMALINK_FIELD,
          searchByValue: permalink,
        },
      }),
    );

    const existing = lookup.data?.[0];
    if (!existing) {
      await ctx.step("create-experiment-record", async () =>
        sdk.runAction({
          appKey: "airtable",
          actionType: "write",
          actionKey: "createRecord",
          connection: "airtable",
          inputs: {
            applicationId: AIRTABLE_BASE_ID,
            tableName: AIRTABLE_TABLE_NAME,
            [PERMALINK_FIELD]: permalink,
            [TITLE_FIELD]: title,
            [OWNER_FIELD]: owner,
            [STATUS_FIELD]: status,
          },
        }),
      );
      return { created: true, permalink };
    }

    const record = RecordSchema.parse(existing);
    const currentStatus = String(record[STATUS_FIELD] ?? "");
    if (currentStatus === status) {
      return { skipped: true, reason: "status-unchanged", recordId: record.id };
    }

    const update = await ctx.step("update-experiment-record-status", async () =>
      sdk.runAction({
        appKey: "airtable",
        actionType: "write",
        actionKey: "updateRecord",
        connection: "airtable",
        inputs: {
          rowId: record.id,
          applicationId: AIRTABLE_BASE_ID,
          tableName: AIRTABLE_TABLE_NAME,
          [PERMALINK_FIELD]: permalink,
          [TITLE_FIELD]: title,
          [OWNER_FIELD]: owner,
          [STATUS_FIELD]: status,
        },
      }),
    );

    return {
      updated: true,
      recordId: record.id,
      from: currentStatus,
      to: status,
      result: update.data?.[0] ?? null,
    };
  },
);

export default workflow;
