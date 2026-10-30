import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table that holds one row per client call, keyed by Zoom meeting ID.
const TABLE_ID = "YOUR_TABLE_ID";
// Table field key for the Zoom meeting ID column (used to match rows).
const MEETING_ID_FIELD = "f1";
// Table field key for the client name column (used in the file name).
const CLIENT_NAME_FIELD = "f2";
// Dropbox folder the audio is saved into, for example "/Team/Client calls".
const DROPBOX_FOLDER = "/YOUR_DROPBOX_FOLDER";
// Status written to a placeholder row when a meeting has no matching row.
const PLACEHOLDER_STATUS = "Needs client";
// Words added after the client name and date in the saved file name.
const FILE_SUFFIX = "AudioRecording";

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    topic: z.string().nullable().optional(),
    start_time: z.string().nullable().optional(),
    recording_files: z
      .array(
        z
          .object({
            file_type: z.string().nullable().optional(),
            download_url: z.string().nullable().optional(),
          })
          .loose(),
      )
      .nullable()
      .optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "save-client-call-audio-to-team-shared-drive",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const meetingId = String(input.id ?? "").trim();
    if (!meetingId) {
      return { skipped: true, reason: "no-meeting-id" };
    }

    const audio = (input.recording_files ?? []).find(
      (file) => file.file_type === "M4A" && file.download_url,
    );
    if (!audio?.download_url) {
      return { skipped: true, reason: "no-audio-file", meetingId };
    }

    const lookup = await ctx.step("find-client-row", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TABLE_ID,
          filter_count: "1",
          field_data_key: MEETING_ID_FIELD,
          operator: "exact",
          lookup_value: meetingId,
        },
      }),
    );

    const found = lookup.data?.[0] as Record<string, unknown> | undefined;
    if (!found) {
      await ctx.step("create-placeholder-row", async () =>
        sdk.runAction({
          appKey: "zapier-tables",
          actionType: "write",
          actionKey: "create_record",
          connection: "zapier-tables",
          inputs: {
            table_id: TABLE_ID,
            new__data__f1: meetingId,
            new__data__f4: PLACEHOLDER_STATUS,
          },
        }),
      );
    }

    const clientName = String(
      found?.[CLIENT_NAME_FIELD] || input.topic || "Unknown client",
    ).trim();
    const meetingDate = (input.start_time ?? "").slice(0, 10);
    const fileName = [clientName, meetingDate, FILE_SUFFIX]
      .filter(Boolean)
      .join(" ");

    const upload = await ctx.step("upload-audio-to-dropbox", async () =>
      sdk.runAction({
        appKey: "dropbox",
        actionType: "write",
        actionKey: "file",
        connection: "dropbox",
        inputs: {
          file: audio.download_url,
          directory: DROPBOX_FOLDER,
          new_name: fileName,
          overwrite: "false",
          include_sharing_link: "yes",
        },
      }),
    );

    const saved = upload.data?.[0] as { share_link?: string } | undefined;
    return {
      meetingId,
      fileName,
      shareLink: saved?.share_link ?? null,
      matchedExistingRow: Boolean(found),
    };
  },
);

export default workflow;
