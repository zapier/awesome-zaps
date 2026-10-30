import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Credit-report API endpoint that receives the pull request. The spec doesn't name a provider, so set this to yours.
const CREDIT_PULL_URL = "YOUR_CREDIT_PULL_API_URL";
// Country code added to 10-digit phone numbers (E.164). Change for non-US clients.
const DEFAULT_COUNTRY_CODE = "+1";

const InputSchema = z
  .object({
    client_id: z.union([z.string(), z.number()]),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    ssn: z.string().nullable().optional(),
    dob: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
  })
  .loose();

function toE164(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `${DEFAULT_COUNTRY_CODE}${digits}`;
  return digits.length > 0 ? `+${digits}` : null;
}

const workflow = defineDurable<unknown, unknown>(
  "create-debt-records-and-attach-credit-pull-pd-fs",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const clientId = String(input.client_id).trim();
    const phone = toE164(input.phone);

    const pull = await ctx.step("request-credit-pull", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: CREDIT_PULL_URL,
          payload_type: "json",
          data: {
            client_id: clientId,
            first_name: input.first_name ?? "",
            last_name: input.last_name ?? "",
            ssn: input.ssn ?? "",
            dob: input.dob ?? "",
            address: input.address ?? "",
            phone: phone ?? "",
          },
        },
      }),
    );

    // The credit API's response shape isn't known yet; this reads the webhook action's `content` field. Confirm on a run.
    const report = pull.data?.[0] as { content?: unknown } | undefined;
    if (!report?.content) {
      return {
        pulled: false,
        reason: "credit-pull-returned-no-report",
        clientId,
      };
    }

    // Not built yet: upload the PDF to Google Drive and update the HubSpot deal. See SKILL.md.
    return { pulled: true, clientId };
  },
);

export default workflow;
