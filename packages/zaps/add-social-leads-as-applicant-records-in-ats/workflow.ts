import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Your applicant tracking system's webhook URL, which accepts applicant records as JSON.
const ATS_WEBHOOK_URL = "YOUR_ATS_WEBHOOK_URL";
// Stage that sourced applicants are assigned to on creation.
const INTAKE_STAGE = "YOUR_INTAKE_STAGE";
// Source tag written to every applicant record.
const SOURCE_TAG = "Facebook Lead Ads";

const InputSchema = z
  .object({
    full_name: z.string().nullable().optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone_number: z.string().nullable().optional(),
    language: z.string().nullable().optional(),
  })
  .loose();

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

function cleanPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return raw.trim().startsWith("+") ? `+${digits}` : digits;
}

const workflow = defineDurable<unknown, unknown>(
  "add-social-leads-as-applicant-records-in-ats",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const fullName = (input.full_name ?? "").trim();
    const split = splitName(fullName);
    const applicant = {
      first_name: input.first_name ?? split.first,
      last_name: input.last_name ?? split.last,
      email: (input.email ?? "").trim().toLowerCase(),
      phone: cleanPhone(input.phone_number ?? ""),
      language: input.language ?? "",
      source: SOURCE_TAG,
      stage: INTAKE_STAGE,
      match_by: "email",
    };

    await ctx.step("post-applicant-to-ats", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: ATS_WEBHOOK_URL,
          payload_type: "json",
          data: applicant,
          unflatten: "no",
          extract_variables: "no",
        },
      }),
    );

    return { email: applicant.email, posted: true };
  },
);

export default workflow;
