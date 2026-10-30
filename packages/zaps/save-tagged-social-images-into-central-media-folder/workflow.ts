import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Drive folder ID of the shared media folder (the long ID in the folder's URL).
const MEDIA_FOLDER_ID = "YOUR_MEDIA_FOLDER_ID";

// Only items with a downloadable media URL are saved. Set to false to fail the run instead of skipping.
const SKIP_ITEMS_WITHOUT_MEDIA = true;

const InputSchema = z
  .object({
    media_url: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    timestamp: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "save-tagged-social-images-into-central-media-folder",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const mediaUrl = input.media_url?.trim() ?? "";
    if (!mediaUrl) {
      if (SKIP_ITEMS_WITHOUT_MEDIA) {
        return { skipped: true, reason: "no-media-url" };
      }
      throw new Error("Tagged post has no media URL");
    }

    const uploader = (input.username ?? "unknown").replace(
      /[^a-zA-Z0-9_-]/g,
      "_",
    );
    const postedAt = (input.timestamp ?? "").replace(/[^0-9T-]/g, "");
    const newName = `${uploader}-${postedAt || "no-timestamp"}`;

    const upload = await ctx.step("upload-media-to-drive", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "write",
        actionKey: "file",
        connection: "google-drive",
        inputs: {
          file: mediaUrl,
          folder: MEDIA_FOLDER_ID,
          new_name: newName,
        },
      }),
    );

    return { name: newName, uploaded: upload.data?.[0] ?? null };
  },
);

export default workflow;
