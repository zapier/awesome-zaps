import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Jotform Enterprise workspace ID that holds the partner form and the internal intake forms.
const WORKSPACE_ID = "YOUR_WORKSPACE_ID";
// Internal intake form that each partner submission is copied into.
const INTAKE_FORM_ID = "YOUR_INTAKE_FORM_ID";
// Optional secondary intake form for a separate review queue. Leave empty to skip it.
const SECONDARY_INTAKE_FORM_ID = "";
// Internal intake field key -> partner form answer key. Fill both sides from the form field keys shown by the Jotform create-submission action.
const FIELD_MAP: Record<string, string> = {
  YOUR_INTAKE_FIELD_KEY: "YOUR_PARTNER_FIELD_KEY",
};

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-internal-intake-records-from-partner-form-entries",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const intakeInputs = Object.fromEntries(
      Object.entries(FIELD_MAP).map(([intakeKey, sourceKey]) => [
        intakeKey,
        input[sourceKey] ?? "",
      ]),
    );

    const intake = await ctx.step("create-intake-submission", async () =>
      sdk.runAction({
        appKey: "jotform-enterprise",
        actionType: "write",
        actionKey: "create_submission",
        connection: "jotform-enterprise",
        inputs: {
          workspaceId: WORKSPACE_ID,
          form: INTAKE_FORM_ID,
          ...intakeInputs,
        },
      }),
    );

    const secondary = SECONDARY_INTAKE_FORM_ID
      ? await ctx.step("create-secondary-submission", async () =>
          sdk.runAction({
            appKey: "jotform-enterprise",
            actionType: "write",
            actionKey: "create_submission",
            connection: "jotform-enterprise",
            inputs: {
              workspaceId: WORKSPACE_ID,
              form: SECONDARY_INTAKE_FORM_ID,
              ...intakeInputs,
            },
          }),
        )
      : null;

    return {
      sourceId: input.id ?? null,
      intakeCreated: intake.data.length,
      secondaryCreated: secondary ? secondary.data.length : 0,
    };
  },
);

export default workflow;
