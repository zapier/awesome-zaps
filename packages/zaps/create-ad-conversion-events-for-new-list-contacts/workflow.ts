import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// HubSpot contact list whose additions create conversion events. Use the list ID from the list's URL.
const HUBSPOT_LIST_ID = "YOUR_HUBSPOT_LIST_ID";
// LinkedIn ad account ID that owns the conversion (dropdown value on the LinkedIn action).
const LINKEDIN_ACCOUNT_ID = "YOUR_LINKEDIN_ACCOUNT_ID";
// LinkedIn Conversions API conversion that receives each event (dropdown value on the LinkedIn action).
const LINKEDIN_CONVERSION_ID = "YOUR_LINKEDIN_CONVERSION_ID";

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    properties: z
      .object({
        email: z.string().nullable().optional(),
        firstname: z.string().nullable().optional(),
        lastname: z.string().nullable().optional(),
        company: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-ad-conversion-events-for-new-list-contacts",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const props = input.properties ?? {};
    const contactId = String(input.id ?? "").trim();
    const email = (props.email ?? "").trim().toLowerCase();
    if (!email) {
      return { skipped: true, reason: "no-email", contactId };
    }

    const firstName = (props.firstname ?? "").trim();
    const lastName = (props.lastname ?? "").trim();
    // LinkedIn only accepts name fields as a pair, so send them together or not at all.
    const nameFields =
      firstName && lastName
        ? {
            first_name: firstName,
            last_name: lastName,
            company: (props.company ?? "").trim() || undefined,
          }
        : {};

    const conversion = await ctx.step(
      "create-linkedin-conversion-event",
      async () =>
        sdk.runAction({
          appKey: "linkedin-conversions",
          actionType: "write",
          actionKey: "create_conversion_event",
          connection: "linkedin-conversions",
          inputs: {
            account: LINKEDIN_ACCOUNT_ID,
            conversion: LINKEDIN_CONVERSION_ID,
            email,
            // The HubSpot contact ID makes each contact produce one event, even if the list add is retried.
            event_id: contactId,
            ...nameFields,
          },
        }),
    );

    return { contactId, email, conversion: conversion.data[0] ?? null };
  },
);

export default workflow;
