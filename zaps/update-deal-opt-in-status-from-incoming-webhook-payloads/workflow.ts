import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  DEAL_ID_KEY,
  OPT_OUT_KEY,
  CONSENT_FIELD_KEY,
  OPT_IN_VALUE,
  OPT_OUT_VALUE,
} from "./config.ts";

const sdk = createZapierSdk();

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
        connection: "pipedrive",
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
        connection: "pipedrive",
        inputs: { id: Number(deal.id), [CONSENT_FIELD_KEY]: consent },
      }),
    );

    return { updated: true, dealId: deal.id, consent };
  },
);

export default workflow;
