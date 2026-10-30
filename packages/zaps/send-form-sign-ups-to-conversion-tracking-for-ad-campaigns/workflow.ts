import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// LinkedIn ad account ID that owns the conversion (the number in the Campaign Manager account URL).
const LINKEDIN_AD_ACCOUNT = "YOUR_LINKEDIN_AD_ACCOUNT_ID";
// LinkedIn Conversions API conversion that each form sign-up is reported to.
const LINKEDIN_CONVERSION = "YOUR_LINKEDIN_CONVERSION_ID";

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    Email: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "send-form-sign-ups-to-conversion-tracking-for-ad-campaigns",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const submissionId = String(input.id ?? "").trim();
    const email = (input.Email ?? "").trim();

    if (!submissionId || !email) {
      return { skipped: true, reason: "missing-submission-id-or-email" };
    }

    const conversion = await ctx.step(
      "send-linkedin-conversion-event",
      async () =>
        sdk.runAction({
          appKey: "linkedin-conversions",
          actionType: "write",
          actionKey: "create_conversion_event",
          connection: "linkedin-conversions",
          inputs: {
            account: LINKEDIN_AD_ACCOUNT,
            conversion: LINKEDIN_CONVERSION,
            email,
            event_id: submissionId,
          },
        }),
    );

    return { submissionId, status: conversion.data?.[0]?.status ?? null };
  },
);

export default workflow;
