import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table of temporary call records. Its ID is in the table's URL.
const CALLS_TABLE_ID = "YOUR_CALLS_TABLE_ID";
// Column in the Calls table that holds the normalized caller phone number.
const PHONE_FIELD = "phone";
// Column in the Calls table that holds the HubSpot ticket ID for the call.
const TICKET_REFERENCE_FIELD = "ticket_reference";
// Address that receives an alert when a call has no ticket. Use an address you read.
const ALERT_EMAIL = "YOUR_ALERT_EMAIL";

const InputSchema = z
  .object({
    caller_number: z.string(),
    call_status: z.string().nullable().optional(),
    started_at: z.string().nullable().optional(),
    ended_at: z.string().nullable().optional(),
    recording_url: z.string().nullable().optional(),
    caller_email: z.string().nullable().optional(),
    call_summary: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "update-support-ticket-when-call-ends-with-details",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const phone = input.caller_number.replace(/\D/g, "");
    const callStatus = input.call_status ?? "unknown";
    const summary = input.call_summary ?? "No call summary provided.";

    const alertMissingTicket = async (reason: string) => {
      await ctx.step("send-missing-ticket-alert", async () =>
        sdk.runAction({
          appKey: "gmail",
          actionType: "write",
          actionKey: "message",
          connection: "gmail",
          inputs: {
            to: [ALERT_EMAIL],
            subject: `[Call ended] No support ticket for ${input.caller_number}`,
            body: `A call ended (${callStatus}) but no support ticket was found (${reason}).\n\nRecording: ${input.recording_url ?? "none"}\nSummary: ${summary}`,
          },
        }),
      );
      return { skipped: true, reason };
    };

    const calls = await ctx.step("find-call-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        inputs: {
          table_id: CALLS_TABLE_ID,
          [PHONE_FIELD]: phone,
        },
      }),
    );
    const call = calls.data[0] as
      { id?: string; [key: string]: unknown } | undefined;
    const ticketId = call?.[TICKET_REFERENCE_FIELD];
    if (!call?.id || !ticketId) {
      return alertMissingTicket("no-ticket-reference");
    }

    const ticketLookup = await ctx.step("find-ticket", async () =>
      sdk.runAction({
        appKey: "hubspot",
        actionType: "write",
        actionKey: "get_ticket_by_id",
        connection: "hubspot",
        inputs: { id: String(ticketId) },
      }),
    );
    const ticket = ticketLookup.data[0] as { id?: string } | undefined;
    if (!ticket?.id) {
      return alertMissingTicket("ticket-not-found");
    }

    const ownerRecord = input.caller_email
      ? await ctx.step("find-owner-by-email", async () =>
          sdk.runAction({
            appKey: "hubspot",
            actionType: "search",
            actionKey: "find_owner_by_email",
            connection: "hubspot",
            inputs: { owner_email: input.caller_email },
          }),
        )
      : null;
    const owner = ownerRecord?.data[0] as
      { id?: string; email?: string } | undefined;
    const ownerId =
      input.caller_email &&
      owner?.email?.toLowerCase() === input.caller_email.toLowerCase()
        ? owner.id
        : undefined;

    await ctx.step("update-ticket", async () =>
      sdk.runAction({
        appKey: "hubspot",
        actionType: "write",
        actionKey: "update_crm_ticket",
        connection: "hubspot",
        inputs: {
          id: ticket.id,
          subject: `Call ${callStatus} from ${input.caller_number}`,
          content: `Call status: ${callStatus}\nStarted: ${input.started_at ?? "unknown"}\nEnded: ${input.ended_at ?? "unknown"}\nRecording: ${input.recording_url ?? "none"}\n\n${summary}`,
          ...(ownerId ? { hubspot_owner_id: ownerId } : {}),
        },
      }),
    );

    const noteAt = await ctx.step("capture-note-time", async () =>
      new Date().toISOString(),
    );

    await ctx.step("add-call-note", async () =>
      sdk.runAction({
        appKey: "hubspot",
        actionType: "write",
        actionKey: "create_engagement",
        connection: "hubspot",
        inputs: {
          type: "NOTE",
          ticketIds: [ticket.id],
          body: `Call summary (${noteAt}): ${summary}`,
        },
      }),
    );

    await ctx.step("delete-call-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "delete_record",
        inputs: { table_id: CALLS_TABLE_ID, id: call.id },
      }),
    );

    return { ticketId: ticket.id, callStatus, ownerMatched: Boolean(ownerId) };
  },
);

export default workflow;
