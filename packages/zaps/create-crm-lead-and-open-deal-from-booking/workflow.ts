import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Only bookings whose event name contains this text (case-insensitive) continue. Set to "" to accept every event type.
const EVENT_NAME_MATCH = "coaching session";
// Pipedrive stage ID (a number) that new deals open in. Replace 0 with your stage ID (YOUR_STAGE_ID).
const INCOMING_STAGE_ID = 0;
// Pipedrive user ID (a number) that owns new deals. Replace 0 with your user ID (YOUR_OWNER_ID).
const OWNER_ID = 0;

const InputSchema = z
  .object({
    // Calendly payload keys. Check these against a real invitee_created payload when you set up the trigger.
    invitee_name: z.string().nullable().optional(),
    invitee_email: z.string().nullable().optional(),
    invitee_phone: z.string().nullable().optional(),
    event_name: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
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
    const personId = personResult.data[0]?.id;
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
          stage_id: INCOMING_STAGE_ID,
          owner_id: OWNER_ID,
          status: "open",
        },
      }),
    );

    return { personId, dealId: dealResult.data[0]?.id ?? null };
  },
);

export default workflow;
