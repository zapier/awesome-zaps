import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Pipedrive app key and the connection alias it runs against.
const PIPEDRIVE_APP_KEY = "pipedrive";
const PIPEDRIVE_CONNECTION = "pipedrive";
// Pipedrive custom deal field key that stores the external campaign identifier (the field's key under Settings > Data fields).
const EXTERNAL_ID_FIELD = "YOUR_PIPEDRIVE_CUSTOM_FIELD_KEY";

const InputSchema = z
  .object({
    deal_id: z.union([z.string(), z.number()]).nullable().optional(),
    campaign_id: z.union([z.string(), z.number()]).nullable().optional(),
    utm_campaign: z.union([z.string(), z.number()]).nullable().optional(),
    external_id: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "add-external-campaign-identifier-to-crm-deal-record",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const dealId = Number(input.deal_id);
    const externalId = String(
      input.campaign_id ?? input.utm_campaign ?? input.external_id ?? "",
    ).trim();

    if (!Number.isInteger(dealId) || !externalId) {
      return { skipped: true, reason: "missing-deal-reference-or-identifier" };
    }

    const lookup = await ctx.step("find-deal", async () =>
      sdk.runAction({
        appKey: PIPEDRIVE_APP_KEY,
        actionType: "search",
        actionKey: "get_deal",
        connection: PIPEDRIVE_CONNECTION,
        inputs: { id: String(dealId) },
      }),
    );

    const deal = lookup.data?.[0] as Record<string, unknown> | undefined;
    if (!deal) {
      return { skipped: true, reason: "deal-not-found", dealId };
    }
    if (String(deal[EXTERNAL_ID_FIELD] ?? "") === externalId) {
      return { skipped: true, reason: "identifier-already-set", dealId };
    }

    const update = await ctx.step("update-deal-external-id", async () =>
      sdk.runAction({
        appKey: PIPEDRIVE_APP_KEY,
        actionType: "write",
        actionKey: "update_deal_v2",
        connection: PIPEDRIVE_CONNECTION,
        inputs: { id: dealId, [EXTERNAL_ID_FIELD]: externalId },
      }),
    );

    return { dealId, externalId, updated: update.data?.[0] ?? null };
  },
);

export default workflow;
