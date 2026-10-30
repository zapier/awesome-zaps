import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// LeadConnector workflow (campaign) ID to enroll each signup in. Copy it from the workflow's settings in LeadConnector.
const CAMPAIGN_ID = "YOUR_CAMPAIGN_ID";
// Country code added to 10-digit phone numbers that have no "+" prefix (1 = US and Canada).
const DEFAULT_COUNTRY_CODE = "1";
// Source written to the contact, so enrollments from this webhook can be traced in LeadConnector.
const SIGNUP_SOURCE = "webhook";

const InputSchema = z
  .object({
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
  })
  .loose();

// Formats a phone number as E.164 ("+" then digits), or returns null when it has no digits.
function toE164(raw: string | null | undefined) {
  const trimmed = (raw ?? "").trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (digits.length === 10) return `+${DEFAULT_COUNTRY_CODE}${digits}`;
  return `+${digits}`;
}

const workflow = defineDurable<unknown, unknown>(
  "enroll-webhook-signups-into-sms-reminder-campaign-for-event",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const email = input.email?.trim() || null;
    const phone = toE164(input.phone);
    if (!email && !phone) {
      return { skipped: true, reason: "no-email-or-phone" };
    }

    const contact = {
      firstName: input.first_name ?? undefined,
      lastName: input.last_name ?? undefined,
      email: email ?? undefined,
      phone: phone ?? undefined,
    };

    await ctx.step("add-update-lead-contact", async () =>
      sdk.runAction({
        appKey: "leadconnector",
        actionType: "write",
        actionKey: "add_update_contact",
        connection: "leadconnector",
        inputs: { ...contact, source: SIGNUP_SOURCE, lead: true },
      }),
    );

    await ctx.step("enroll-contact-in-sms-campaign", async () =>
      sdk.runAction({
        appKey: "leadconnector",
        actionType: "write",
        actionKey: "campaign",
        connection: "leadconnector",
        inputs: {
          campaign_id: CAMPAIGN_ID,
          ...contact,
          leadSource: SIGNUP_SOURCE,
        },
      }),
    );

    return { enrolled: true, email, phone };
  },
);

export default workflow;
