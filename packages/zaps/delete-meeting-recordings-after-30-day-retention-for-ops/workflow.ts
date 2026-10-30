import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Days to keep a cloud recording before it is deleted.
const RETENTION_DAYS = 30;
// Zoom deletion type: "permanent" removes the recordings; "trash" moves them to Zoom's trash first.
const DELETION_TYPE = "permanent";

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    topic: z.string().nullable().optional(),
    uuid: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "delete-meeting-recordings-after-30-day-retention-for-ops",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const meetingId = String(input.id);

    await ctx.wait("wait-retention-period", RETENTION_DAYS * 24 * 60 * 60);

    const check = await ctx.step("check-recording-exists", async () =>
      sdk.runAction({
        appKey: "zoom",
        actionType: "write",
        actionKey: "_zap_raw_request",
        connection: "zoom",
        inputs: {
          url: `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
          fail_on_errors: "false",
        },
      }),
    );

    const recordingFiles =
      (check.data?.[0] as { recording_files?: unknown[] } | undefined)
        ?.recording_files ?? [];
    if (recordingFiles.length === 0) {
      return { skipped: true, reason: "recording-not-found", meetingId };
    }

    await ctx.step("delete-meeting-recordings", async () =>
      sdk.runAction({
        appKey: "zoom",
        actionType: "write",
        actionKey: "delete_meeting_recordings",
        connection: "zoom",
        inputs: { meeting_id: meetingId, deletion_type: DELETION_TYPE },
      }),
    );

    return { skipped: false, meetingId, deletionType: DELETION_TYPE };
  },
);

export default workflow;
