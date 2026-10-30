import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Sheets spreadsheet ID (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Email address that receives the recording link. Must be the connected Gmail account's own address.
const OWNER_EMAIL = "YOUR_OWNER_EMAIL";
// Status written to every logged call.
const COMPLETED_STATUS = "Completed";
// Column keys for the log sheet (COL$A = column A). Map these to your own headers.
const COLUMNS = {
  callReference: "COL$A",
  sessionId: "COL$B",
  callType: "COL$C",
  agentId: "COL$D",
  start: "COL$E",
  end: "COL$F",
  duration: "COL$G",
  recordingLink: "COL$H",
  status: "COL$I",
};

const InputSchema = z
  .object({
    call_reference: z.string().nullable().optional(),
    session_id: z.string().nullable().optional(),
    call_type: z.string().nullable().optional(),
    agent_id: z.string().nullable().optional(),
    started_at: z.string().nullable().optional(),
    ended_at: z.string().nullable().optional(),
    end_reason: z.string().nullable().optional(),
    recording_url: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-call-logs-and-email-recording-link-to-owner",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    // Only finished calls are logged: the event must carry an end time.
    if (!input.ended_at) {
      return { skipped: true, reason: "call-not-completed" };
    }

    const callReference = input.call_reference ?? "";
    const durationSeconds = await ctx.step(
      "compute-call-duration",
      async () => {
        if (!input.started_at || !input.ended_at) return "";
        const startedAt = new Date(input.started_at).getTime();
        const endedAt = new Date(input.ended_at).getTime();
        return String(Math.round((endedAt - startedAt) / 1000));
      },
    );

    const logged = await ctx.step("append-call-log-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          [COLUMNS.callReference]: callReference,
          [COLUMNS.sessionId]: input.session_id ?? "",
          [COLUMNS.callType]: input.call_type ?? "",
          [COLUMNS.agentId]: input.agent_id ?? "",
          [COLUMNS.start]: input.started_at ?? "",
          [COLUMNS.end]: input.ended_at,
          [COLUMNS.duration]: durationSeconds,
          [COLUMNS.recordingLink]: input.recording_url ?? "",
          [COLUMNS.status]: COMPLETED_STATUS,
        },
      }),
    );

    // Email the owner only when a recording exists.
    if (!input.recording_url) {
      return {
        logged: true,
        callReference,
        emailed: false,
        reason: "no-recording-url",
      };
    }

    const emailed = await ctx.step("email-recording-link-to-owner", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: [OWNER_EMAIL],
          subject: `Call recording: ${callReference} (agent ${input.agent_id ?? "unknown"})`,
          body: `Recording for call ${callReference}, started ${input.started_at ?? "unknown"}:\n\n${input.recording_url}`,
        },
      }),
    );

    return {
      logged: true,
      callReference,
      emailed: true,
      row: logged.data?.[0] ?? null,
      email: emailed.data?.[0] ?? null,
    };
  },
);

export default workflow;
