import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Ads conversion action to credit, by its name in Google Ads.
const CONVERSION_ACTION_NAME = "YOUR_CONVERSION_ACTION_NAME";
// Google Ads account to send from ("Use Google Ads as..."), digits only.
const GOOGLE_ADS_ACCOUNT_ID = "YOUR_GOOGLE_ADS_ACCOUNT_ID";
// HubSpot contact property that holds the lifecycle stage.
const LIFECYCLE_PROPERTY = "lifecyclestage";
// Lifecycle value that marks a contact as a customer.
const CUSTOMER_STAGE = "customer";
// Seconds to wait after the change before sending, so the attribution window can close (24 hours).
const ATTRIBUTION_DELAY_SECONDS = 24 * 60 * 60;

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    properties: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "send-customer-conversion-to-ad-platform-after-update",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const properties = input.properties ?? {};
    const contactId = input.id ?? null;

    if (properties[LIFECYCLE_PROPERTY] !== CUSTOMER_STAGE) {
      return { skipped: true, reason: "not-customer-stage", contactId };
    }

    // Prefer the Google click ID; fall back to the contact's email.
    const clickId =
      typeof properties.hs_google_click_id === "string"
        ? properties.hs_google_click_id
        : null;
    const email =
      typeof properties.email === "string" ? properties.email : null;
    const identifierSource = clickId ? "gclid" : email ? "email" : null;
    if (!identifierSource) {
      return { skipped: true, reason: "no-identifier", contactId };
    }

    const changedAt =
      typeof properties.hs_lastmodifieddate === "string"
        ? properties.hs_lastmodifieddate
        : null;

    await ctx.wait("wait-attribution-window", ATTRIBUTION_DELAY_SECONDS);

    const conversion = await ctx.step("send-offline-conversion", async () =>
      sdk.runAction({
        appKey: "google-ads",
        actionType: "write",
        actionKey: "send_offline_conversion_v2",
        connection: "google-ads",
        inputs: {
          name: CONVERSION_ACTION_NAME,
          time: changedAt ?? new Date().toISOString(),
          mainAccountId: GOOGLE_ADS_ACCOUNT_ID,
          identifier_source: [identifierSource],
        },
      }),
    );

    return {
      contactId,
      identifierSource,
      conversion: conversion.data?.[0] ?? null,
    };
  },
);

export default workflow;
