import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Form ID (the long ID in the form's URL). The trigger watches this form.
const FORM_ID = "YOUR_FORM_ID";
// Intake endpoint that receives each backlog item as JSON.
const INTAKE_URL = "YOUR_INTAKE_ENDPOINT_URL";
// Product or context label sent with every item.
const PRODUCT_CONTEXT = "YOUR_PRODUCT_NAME";
// Form field keys for the submission. Check them against a real response before use.
const EMAIL_FIELD = "email";
const TITLE_FIELD = "title";
const DESCRIPTION_FIELD = "description";
const CONSENT_FIELD = "consent";
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

const workflow = defineDurable<unknown, unknown>(
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
