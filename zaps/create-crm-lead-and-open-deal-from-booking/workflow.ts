import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { EVENT_NAME_MATCH, INCOMING_STAGE_ID, OWNER_ID } from "./config.ts";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    // Calendly payload keys. Check these against a real invitee_created payload when you set up the trigger.
    invitee_name: z.string().nullable().optional(),
    invitee_email: z.string().nullable().optional(),
    invitee_phone: z.string().nullable().optional(),
    event_name: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "create-crm-lead-and-open-deal-from-booking",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const eventName = input.event_name ?? "";
    if (
      EVENT_NAME_MATCH &&
      !eventName.toLowerCase().includes(EVENT_NAME_MATCH.toLowerCase())
    ) {
      return { skipped: true, reason: "event-not-qualifying", eventName };
    }

    const inviteeName =
      input.invitee_name ?? input.invitee_email ?? "Unknown invitee";
    const inviteeEmail = input.invitee_email ?? "";
    const inviteePhone = input.invitee_phone ?? "";

    const personResult = await ctx.step("create-pipedrive-person", async () =>
      sdk.runAction({
        appKey: "pipedrive",
        actionType: "write",
        actionKey: "create_personV2",
        connection: "pipedrive",
        inputs: {
          name: inviteeName,
          emails: inviteeEmail ? [inviteeEmail] : [],
          phones: inviteePhone ? [inviteePhone] : [],
        },
      }),
    );
    const personId = (
      personResult.data[0] as { id?: number | string } | undefined
    )?.id;
    if (!personId) {
      throw new Error("Pipedrive did not return a person ID");
    }

    const dealResult = await ctx.step("create-pipedrive-deal", async () =>
      sdk.runAction({
        appKey: "pipedrive",
        actionType: "write",
        actionKey: "create_deal_v2",
        connection: "pipedrive",
        inputs: {
          title: `${eventName || "Booking"}: ${inviteeName}`,
          person_id: Number(personId),
          stage_id: Number(INCOMING_STAGE_ID),
          owner_id: Number(OWNER_ID),
          status: "open",
        },
      }),
    );

    return {
      personId,
      dealId:
        (dealResult.data[0] as { id?: number | string } | undefined)?.id ??
        null,
    };
  },
);

export default workflow;
