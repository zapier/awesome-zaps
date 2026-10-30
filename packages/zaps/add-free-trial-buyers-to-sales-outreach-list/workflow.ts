import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// ActiveCampaign list ID for your sales outreach list. Every trial signup is added to it.
const OUTREACH_LIST_ID = "YOUR_LIST_ID";
// Tag added to each trial buyer after they are on the outreach list.
const TRIAL_TAG = "Trial buyer";
// Set to false to skip tagging.
const ADD_TRIAL_TAG = true;

const InputSchema = z
  .object({
    contact__email: z.string().nullable().optional(),
    contact__first_name: z.string().nullable().optional(),
    contact__last_name: z.string().nullable().optional(),
    contact__id: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "add-free-trial-buyers-to-sales-outreach-list",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const email = input.contact__email?.trim() ?? "";
    if (!email) {
      return { skipped: true, reason: "no-email" };
    }

    const contact = await ctx.step("create-or-update-contact", async () =>
      sdk.runAction({
        appKey: "activecampaign",
        actionType: "write",
        actionKey: "action_4",
        connection: "activecampaign",
        inputs: {
          email,
          first_name: input.contact__first_name ?? "",
          last_name: input.contact__last_name ?? "",
        },
      }),
    );

    const listed = await ctx.step("add-contact-to-outreach-list", async () =>
      sdk.runAction({
        appKey: "activecampaign",
        actionType: "write",
        actionKey: "list_subscription",
        connection: "activecampaign",
        inputs: {
          action: "subscribe",
          list_id: OUTREACH_LIST_ID,
          contact_email: email,
        },
      }),
    );

    let tagged = null;
    if (ADD_TRIAL_TAG) {
      tagged = await ctx.step("add-trial-buyer-tag", async () =>
        sdk.runAction({
          appKey: "activecampaign",
          actionType: "write",
          actionKey: "contact_tag",
          connection: "activecampaign",
          inputs: {
            action: "Add",
            contact_email: email,
            tag_string: TRIAL_TAG,
          },
        }),
      );
    }

    return {
      email,
      contact: contact.data?.[0] ?? null,
      listed: listed.data?.[0] ?? null,
      tagged: tagged?.data?.[0] ?? null,
    };
  },
);

export default workflow;
