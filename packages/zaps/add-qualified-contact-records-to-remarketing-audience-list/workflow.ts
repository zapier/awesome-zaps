import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Table ID the trigger watches; each new row is one contact.
const TABLE_ID = "YOUR_TABLE_ID";
// Google Ads account the upload acts as (the customer ID shown in Google Ads).
const GOOGLE_ADS_ACCOUNT_ID = "YOUR_GOOGLE_ADS_ACCOUNT_ID";
// Google Ads customer list the contacts are added to (a number, from Google Ads).
const CUSTOMER_LIST_ID = 0;
// Case statuses that qualify a row. Rows with any other status are skipped.
const CASE_STATUSES = ["Qualified"];

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    data: z
      .object({
        f1: z.string().nullable().optional(),
        f2: z.boolean().nullable().optional(),
        f3: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "add-qualified-contact-records-to-remarketing-audience-list",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const data = input.data ?? {};

    const status = (data.f3 ?? "").trim();
    if (!CASE_STATUSES.includes(status)) {
      return { skipped: true, reason: "status-not-qualifying", status };
    }

    const email = (data.f1 ?? "").trim().toLowerCase();
    if (!email) {
      return { skipped: true, reason: "no-email", recordId: input.id ?? null };
    }

    const consent = data.f2 === true ? "CONSENT_GRANTED" : "CONSENT_DENIED";

    const upload = await ctx.step("add-contact-to-customer-list", async () =>
      sdk.runAction({
        appKey: "google-ads",
        actionType: "write",
        actionKey: "add_email_to_customer_list_v3",
        connection: "google-ads",
        inputs: {
          mainAccountId: GOOGLE_ADS_ACCOUNT_ID,
          customer_list_id: CUSTOMER_LIST_ID,
          emailAddress: email,
          adUserData: consent,
          adPersonalization: consent,
        },
      }),
    );

    return {
      skipped: false,
      email,
      status,
      uploaded: upload.data?.[0] ?? null,
    };
  },
);

export default workflow;
