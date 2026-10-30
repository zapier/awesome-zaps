import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Notion data source of the inventory database the trigger watches (its ID, from the Notion data source picker).
const INVENTORY_DATASOURCE_ID = "YOUR_INVENTORY_DATASOURCE_ID";
// Notion data source of the central asset database that gets updated.
const ASSET_DATASOURCE_ID = "YOUR_ASSET_DATASOURCE_ID";
// Property on the inventory item that holds the serial number or unique identifier.
const INVENTORY_IDENTIFIER_PROPERTY = "Serial number";
// Property on the asset item that holds the same identifier, used to find the existing record.
const ASSET_IDENTIFIER_PROPERTY = "Serial number";
// Inventory property -> asset property, one pair per field to copy (device name, model, warranty, notes, contact, owner, status).
const FIELD_MAP: Array<[string, string]> = [
  ["Device name", "Device name"],
  ["Model", "Model"],
  ["Warranty start", "Warranty start"],
  ["Warranty end", "Warranty end"],
  ["Notes", "Notes"],
  ["Contact email", "Contact email"],
  ["Assigned owner", "Assigned owner"],
  ["Inventory status", "Status"],
];

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    last_edited_time: z.string().nullable().optional(),
    properties: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "update-asset-records-from-inventory-changes-for-it-teams",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const props = input.properties ?? {};
    const identifier = String(
      props[INVENTORY_IDENTIFIER_PROPERTY] ?? "",
    ).trim();
    if (!identifier) {
      return { skipped: true, reason: "no-identifier" };
    }

    const match = await ctx.step("find-asset-by-identifier", async () =>
      sdk.runAction({
        appKey: "notion",
        actionType: "search",
        actionKey: "find_data_source_item",
        connection: "notion",
        inputs: {
          datasource: ASSET_DATASOURCE_ID,
          [ASSET_IDENTIFIER_PROPERTY]: identifier,
        },
      }),
    );

    const existing = match.data[0] as
      { id?: string; last_edited_time?: string } | undefined;

    if (
      existing?.last_edited_time &&
      input.last_edited_time &&
      input.last_edited_time <= existing.last_edited_time
    ) {
      return { skipped: true, reason: "incoming-not-newer", identifier };
    }

    const values: Record<string, unknown> = {};
    for (const [inventoryProperty, assetProperty] of FIELD_MAP) {
      values[assetProperty] = props[inventoryProperty] ?? null;
    }

    const write = await ctx.step("upsert-asset-record", async () =>
      existing?.id
        ? sdk.runAction({
            appKey: "notion",
            actionType: "write",
            actionKey: "update_database_item",
            connection: "notion",
            inputs: { id: existing.id, ...values },
          })
        : sdk.runAction({
            appKey: "notion",
            actionType: "write",
            actionKey: "create_database_item",
            connection: "notion",
            inputs: {
              datasource: ASSET_DATASOURCE_ID,
              [ASSET_IDENTIFIER_PROPERTY]: identifier,
              ...values,
            },
          }),
    );

    return {
      identifier,
      action: existing?.id ? "updated" : "created",
      result: write.data[0] ?? null,
    };
  },
);

export default workflow;
