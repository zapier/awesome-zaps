import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { RELEASE_FOLDER_ID } from "@/config";
import googleDrive from "@/connections/google-drive";

const sdk = createZapierSdk();

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
        connection: googleDrive,
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
