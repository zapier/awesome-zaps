import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Drive folder ID to watch for new build artifacts. Set the trigger's Folder to this same ID.
const SOURCE_FOLDER_ID = "YOUR_SOURCE_FOLDER_ID";
// Google Drive folder ID where the timestamped copies are saved.
const RELEASE_FOLDER_ID = "YOUR_RELEASE_FOLDER_ID";

const InputSchema = z
  .object({
    id: z.string(),
    title: z.string().nullable().optional(),
    originalFilename: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "save-new-build-artifacts-into-organized-release-folder",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const sourceName = input.originalFilename ?? input.title ?? "untitled";

    const capturedAt = await ctx.step("capture-timestamp", async () =>
      new Date().toISOString(),
    );
    const releaseName = `${capturedAt} ${sourceName}`;

    const copy = await ctx.step("copy-file-to-release-folder", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "write",
        actionKey: "copy_file",
        connection: "google-drive",
        inputs: {
          file: input.id,
          folder: RELEASE_FOLDER_ID,
          convert: "false",
          new_name: releaseName,
        },
      }),
    );

    return {
      sourceId: input.id,
      releaseName,
      copyId: copy.data?.[0]?.id ?? null,
    };
  },
);

export default workflow;
