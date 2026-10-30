import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Keys in the incoming webhook payload that carry the deal ID and the opt-out flag.
const DEAL_ID_KEY = "deal_id";
const OPT_OUT_KEY = "opt_out";

// The Pipedrive deal custom field that stores consent. Use the field's API key from Pipedrive's field settings.
const CONSENT_FIELD_KEY = "YOUR_CONSENT_FIELD_KEY";

// Values written to the consent field.
const OPT_IN_VALUE = "YES";
const OPT_OUT_VALUE = "NO";

// The Pipedrive connection alias; bound to the account that owns the deals.
const PIPEDRIVE_CONNECTION = "pipedrive";

const InputSchema = z.record(z.string(), z.unknown());
type Input = z.infer<typeof InputSchema>;

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

const workflow = defineDurable<Input, unknown>(
  "update-deal-opt-in-status-from-incoming-webhook-payloads",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));

    const dealId = input[DEAL_ID_KEY];
    if (dealId === null || dealId === undefined || dealId === "") {
      return { skipped: true, reason: "missing-deal-id" };
    }

    // Missing or non-opt-out flags count as opt-in.
    const isOptOut =
      input[OPT_OUT_KEY] === true || input[OPT_OUT_KEY] === "true";
    const consent = isOptOut ? OPT_OUT_VALUE : OPT_IN_VALUE;

    const found = await ctx.step("find-pipedrive-deal", async () =>
      sdk.runAction({
        appKey: "pipedrive",
        actionType: "search",
        actionKey: "get_deal",
        connection: PIPEDRIVE_CONNECTION,
        inputs: { id: String(dealId) },
      }),
    );

    const deal = found.data[0];
    if (!deal) {
      return { skipped: true, reason: "deal-not-found" };
    }

    await ctx.step("update-pipedrive-deal", async () =>
      sdk.runAction({
        appKey: "pipedrive",
        actionType: "write",
        actionKey: "update_deal_v2",
        connection: PIPEDRIVE_CONNECTION,
        inputs: { id: Number(deal.id), [CONSENT_FIELD_KEY]: consent },
      }),
    );

    return { updated: true, dealId: deal.id, consent };
  },
);

export default workflow;
