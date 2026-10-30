import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// HubSpot contact property holding the training status. The trigger watches it, and only its changes are processed.
const TRAINING_PROPERTY = "YOUR_TRAINING_PROPERTY";
// HubSpot checkbox contact property that receives the normalized flag ("true" or "false").
const STATUS_FLAG_PROPERTY = "YOUR_STATUS_FLAG_PROPERTY";
// Training values that mean completed, in lowercase. Any other non-empty value counts as not completed.
const COMPLETED_VALUES = ["completed"];

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    property_name: z.string().nullable().optional(),
    property_value: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "set-training-status-from-updated-contact-profile-records",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const contactId = String(input.id).trim();

    if (input.property_name && input.property_name !== TRAINING_PROPERTY) {
      return { skipped: true, reason: "other-property", contactId };
    }

    const value = (input.property_value ?? "").trim();
    if (!value) {
      return { skipped: true, reason: "empty-training-value", contactId };
    }

    const completed = COMPLETED_VALUES.includes(value.toLowerCase());

    const update = await ctx.step("set-contact-training-status", async () =>
      sdk.runAction({
        appKey: "hubspot",
        actionType: "write",
        actionKey: "update_crm_contact",
        connection: "hubspot",
        inputs: {
          id: contactId,
          [STATUS_FLAG_PROPERTY]: completed ? "true" : "false",
        },
      }),
    );

    return { contactId, completed, updated: update.data?.[0] ?? null };
  },
);

export default workflow;
