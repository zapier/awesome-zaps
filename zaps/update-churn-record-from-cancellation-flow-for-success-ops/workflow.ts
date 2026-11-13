import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  CLIENT_UUID_COLUMN,
  FLOW_NAME_COLUMN,
  SUBSCRIPTION_COLUMN,
  ANSWERS_COLUMN,
  UPDATED_AT_COLUMN,
} from "./config.ts";

const sdk = createZapierSdk();

// Flow names that qualify for a churn update. Other flows are skipped.
const ALLOWED_FLOW_NAMES = ["cancellation", "retention"];
// Seconds to wait after the payload arrives so late edits are captured (7200 = 2 hours).
const DELAY_SECONDS = 7200;

const InputSchema = z
  .object({
    client_uuid: z.string(),
    flow_name: z.string().nullable().optional(),
    subscription_properties: z.array(z.string()).nullable().optional(),
    answers: z
      .array(z.object({ question: z.string(), answer: z.string() }).loose())
      .nullable()
      .optional(),
  })
  .loose();

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

const workflow = defineDurable(
  "update-churn-record-from-cancellation-flow-for-success-ops",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));
    const clientUuid = input.client_uuid.trim();
    const flowName = input.flow_name ?? "";

    if (!ALLOWED_FLOW_NAMES.includes(flowName)) {
      return { skipped: true, reason: "flow-not-configured", flowName };
    }

    await ctx.wait("wait-for-late-edits", DELAY_SECONDS);

    const subscription = (input.subscription_properties ?? []).join("; ");
    const answers = (input.answers ?? [])
      .map((item) => `${item.question}: ${item.answer}`)
      .join(" | ");

    const lookup = await ctx.step("find-churn-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "lookup_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          lookup_key: CLIENT_UUID_COLUMN,
          lookup_value: clientUuid,
        },
      }),
    );

    const existing = lookup.data?.[0] as { id?: number | string } | undefined;

    const updatedAt = await ctx.step("capture-updated-at", async () =>
      new Date().toISOString(),
    );

    const values = {
      [CLIENT_UUID_COLUMN]: clientUuid,
      [FLOW_NAME_COLUMN]: flowName,
      [SUBSCRIPTION_COLUMN]: subscription,
      [ANSWERS_COLUMN]: answers,
      [UPDATED_AT_COLUMN]: updatedAt,
    };

    if (existing?.id) {
      const rowId = String(existing.id);
      const update = await ctx.step("update-churn-row", async () =>
        sdk.runAction({
          appKey: "google-sheets",
          actionType: "write",
          actionKey: "update_row",
          connection: "google-sheets",
          inputs: {
            spreadsheet: SPREADSHEET_ID,
            worksheet: WORKSHEET_ID,
            row: rowId,
            ...values,
          },
        }),
      );
      return {
        action: "updated",
        clientUuid,
        row: rowId,
        result: update.data?.[0] ?? null,
      };
    }

    const created = await ctx.step("add-churn-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          ...values,
        },
      }),
    );

    return { action: "created", clientUuid, result: created.data?.[0] ?? null };
  },
);

export default workflow;
