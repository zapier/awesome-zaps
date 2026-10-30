import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Intake endpoint that receives the normalized lead JSON (a Webhooks by Zapier catch hook or your own URL).
const INTAKE_WEBHOOK_URL = "YOUR_INTAKE_WEBHOOK_URL";
// Set to true to include the raw Facebook lead payload in the body for troubleshooting.
const INCLUDE_RAW_LEAD = true;

const InputSchema = z
  .object({
    full_name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone_number: z.string().nullable().optional(),
    comments: z.string().nullable().optional(),
    created_time: z.string().nullable().optional(),
    form_id: z.string().nullable().optional(),
    page_id: z.string().nullable().optional(),
    ad_id: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "route-new-social-leads-to-intake-webhook-for-processing",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const body = {
      source: "facebook_lead_ads",
      contact: {
        name: input.full_name ?? null,
        email: input.email ?? null,
        phone: input.phone_number ?? null,
      },
      notes: input.comments ?? null,
      ad: {
        form_id: input.form_id ?? null,
        page_id: input.page_id ?? null,
        ad_id: input.ad_id ?? null,
      },
      submitted_at: input.created_time ?? null,
      raw: INCLUDE_RAW_LEAD ? rawInput : undefined,
    };

    const post = await ctx.step("post-lead-to-intake-webhook", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: INTAKE_WEBHOOK_URL,
          payload_type: "json",
          data: body,
          unflatten: "no",
          extract_variables: "no",
        },
      }),
    );

    return { posted: true, status: post.data?.[0] ?? null };
  },
);

export default workflow;
