import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  STRATEGIC_DATA_SOURCE_ID,
  SOURCE_REFERENCE_PROPERTY,
  STATUS_PROPERTY,
  IN_PROGRESS_STATUS,
  SCOPE_CHANGE_PROPERTY,
} from "./config.ts";

const sdk = createZapierSdk();

const InputSchema = z.looseObject({
  properties: z.record(z.string(), z.unknown()).nullable().optional(),
});

// Reads a Notion text, title or select property as a string.
function readText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "name" in value) {
    return String(value.name ?? "").trim();
  }
  return "";
}

const workflow = defineDurable(
  "update-strategic-kr-when-tactical-kr-scope-changes",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const tactical = input.properties ?? {};

    const sourceReference = readText(tactical[SOURCE_REFERENCE_PROPERTY]);
    const status = readText(tactical[STATUS_PROPERTY]);
    if (!sourceReference) {
      return { skipped: true, reason: "no-source-reference" };
    }
    if (status !== IN_PROGRESS_STATUS) {
      return { skipped: true, reason: "not-in-progress", status };
    }

    const found = await ctx.step("find-strategic-kr", async () =>
      sdk.runAction({
        appKey: "notion",
        actionType: "search",
        actionKey: "find_data_source_item",
        connection: "notion",
        inputs: {
          datasource: STRATEGIC_DATA_SOURCE_ID,
          search_fields: [SOURCE_REFERENCE_PROPERTY],
          dynamic_properties: { [SOURCE_REFERENCE_PROPERTY]: sourceReference },
        },
      }),
    );

    // Match by source reference only; never create a strategic record here.
    const strategic = found.data?.[0] as
      { id?: string; properties?: Record<string, unknown> } | undefined;
    if (!strategic?.id) {
      return { skipped: true, reason: "no-strategic-kr", sourceReference };
    }
    if (strategic.properties?.[SCOPE_CHANGE_PROPERTY] === true) {
      return { skipped: true, reason: "scope-change-already-set" };
    }

    const update = await ctx.step("set-strategic-scope-change", async () =>
      sdk.runAction({
        appKey: "notion",
        actionType: "write",
        actionKey: "update_database_item",
        connection: "notion",
        inputs: {
          page: strategic.id,
          datasource: STRATEGIC_DATA_SOURCE_ID,
          dynamic_properties: { [SCOPE_CHANGE_PROPERTY]: true },
        },
      }),
    );

    return { updated: strategic.id, result: update.data?.[0] ?? null };
  },
);

export default workflow;
