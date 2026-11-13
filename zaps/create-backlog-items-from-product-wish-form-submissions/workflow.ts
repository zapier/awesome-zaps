import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  INTAKE_URL,
  PRODUCT_CONTEXT,
  EMAIL_FIELD,
  TITLE_FIELD,
  DESCRIPTION_FIELD,
  CONSENT_FIELD,
} from "./config.ts";

const sdk = createZapierSdk();

// Consent answers (lowercase) that count as Yes. Any other value counts as No.
const CONSENT_YES_VALUES = ["yes", "y", "true", "i agree", "agree"];

const InputSchema = z
  .object({
    [EMAIL_FIELD]: z.string().nullable().optional(),
    [TITLE_FIELD]: z.string().nullable().optional(),
    [DESCRIPTION_FIELD]: z.string().nullable().optional(),
    [CONSENT_FIELD]: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "create-backlog-items-from-product-wish-form-submissions",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const consentAnswer = (input[CONSENT_FIELD] ?? "").trim().toLowerCase();
    const interviewConsent = CONSENT_YES_VALUES.includes(consentAnswer)
      ? "Yes"
      : "No";

    const intake = await ctx.step("post-intake-item", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: INTAKE_URL,
          payload_type: "json",
          extract_variables: "no",
          data: {
            reporter_email: input[EMAIL_FIELD] ?? "",
            request_title: input[TITLE_FIELD] ?? "",
            request_description: input[DESCRIPTION_FIELD] ?? "",
            interview_consent: interviewConsent,
            product: PRODUCT_CONTEXT,
          },
        },
      }),
    );

    return { interviewConsent, intake: intake.data?.[0] ?? null };
  },
);

export default workflow;
