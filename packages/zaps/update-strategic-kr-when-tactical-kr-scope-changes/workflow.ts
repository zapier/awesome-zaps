import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Notion data source ID of the Tactical KRs database (the one the trigger watches).
const TACTICAL_DATA_SOURCE_ID = "YOUR_TACTICAL_KR_DATA_SOURCE_ID";
// Notion data source ID of the Strategic KRs database.
const STRATEGIC_DATA_SOURCE_ID = "YOUR_STRATEGIC_KR_DATA_SOURCE_ID";
// Tactical KR property holding the source reference that links it to its strategic KR.
const SOURCE_REFERENCE_PROPERTY = "YOUR_SOURCE_REFERENCE_PROPERTY";
// Tactical KR status property, and the value that means the KR is in progress.
const STATUS_PROPERTY = "YOUR_STATUS_PROPERTY";
const IN_PROGRESS_STATUS = "In progress";
// Strategic KR checkbox that flags a scope change, set to true by this workflow.
const SCOPE_CHANGE_PROPERTY = "YOUR_SCOPE_CHANGE_PROPERTY";

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

const workflow = defineDurable<unknown, unknown>(
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
