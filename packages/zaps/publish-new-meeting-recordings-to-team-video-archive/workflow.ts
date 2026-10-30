import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Airtable base ID (the "app..." ID in the base's URL).
const AIRTABLE_BASE_ID = "YOUR_AIRTABLE_BASE_ID";
// Airtable table that holds the video archive.
const AIRTABLE_TABLE = "YOUR_TABLE_NAME";
// Column that stores the Zoom recording GUID; existing rows are matched on it.
const GUID_FIELD = "YOUR_GUID_FIELD";
// Column for the recording title.
const TITLE_FIELD = "YOUR_TITLE_FIELD";
// Column for the Vimeo video link.
const VIDEO_URL_FIELD = "YOUR_VIDEO_URL_FIELD";
// Column for the meeting start date.
const DATE_FIELD = "YOUR_DATE_FIELD";
// Vimeo privacy for uploads: "unlisted" keeps videos off public listings.
const VIMEO_PRIVACY = "unlisted";

const InputSchema = z
  .object({
    uuid: z.string(),
    topic: z.string().nullable().optional(),
    start_time: z.string().nullable().optional(),
    video_dl_urls: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "publish-new-meeting-recordings-to-team-video-archive",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const title = input.topic ?? "Untitled meeting";

    const fileUrls = (input.video_dl_urls ?? "")
      .split(/[\s,]+/)
      .filter((url) => url.startsWith("http"));
    if (fileUrls.length === 0) {
      return { skipped: true, reason: "no-recording-files", guid: input.uuid };
    }

    const uploads = await Promise.all(
      fileUrls.map((fileUrl, index) =>
        ctx.step(`upload-recording-video-${index}`, async () => {
          try {
            const result = await sdk.runAction({
              appKey: "vimeo",
              actionType: "write",
              actionKey: "upload_video",
              connection: "vimeo",
              inputs: {
                upload__link: fileUrl,
                name: title,
                privacy__view: VIMEO_PRIVACY,
              },
            });
            const video = result.data?.[0] as { link?: string } | undefined;
            return { ok: true, link: video?.link ?? null };
          } catch (error) {
            return { ok: false, link: null, error: String(error) };
          }
        }),
      ),
    );

    const videoLinks = uploads.flatMap((upload) =>
      upload.ok && upload.link ? [upload.link] : [],
    );
    const failedUploads = uploads.length - videoLinks.length;
    if (videoLinks.length === 0) {
      return {
        skipped: true,
        reason: "all-uploads-failed",
        guid: input.uuid,
        failedUploads,
      };
    }

    const record = await ctx.step("upsert-archive-record", async () =>
      sdk.runAction({
        appKey: "airtable",
        actionType: "write",
        actionKey: "create_or_update_record",
        connection: "airtable",
        inputs: {
          applicationId: AIRTABLE_BASE_ID,
          tableName: AIRTABLE_TABLE,
          lookupPrimary: GUID_FIELD,
          [GUID_FIELD]: input.uuid,
          [TITLE_FIELD]: title,
          [VIDEO_URL_FIELD]: videoLinks.join(", "),
          [DATE_FIELD]: input.start_time ?? "",
        },
      }),
    );

    return {
      guid: input.uuid,
      title,
      videoLinks,
      failedUploads,
      recordId: (record.data?.[0] as { id?: string } | undefined)?.id ?? null,
    };
  },
);

export default workflow;
