import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

import {
  SOURCE_FOLDER_ID,
  DESTINATION_FOLDER_ID,
  SIZE_SUFFIX,
  MIME_PREFIX,
} from "./config.ts";

const sdk = createZapierSdk();

type DriveFile = { id?: string; name?: string; mimeType?: string };

type Outcome =
  | { status: "copied"; name: string; id: string | null }
  | { status: "already-exists"; name: string }
  | { status: "failed"; name: string; error: string };

function sizedName(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return `${name}${SIZE_SUFFIX}`;
  return `${name.slice(0, dot)}${SIZE_SUFFIX}${name.slice(dot)}`;
}

const workflow = defineDurable(
  "create-standardized-resized-image-copies-in-your-media-folder",
  async (ctx) => {
    const listing = await ctx.step("list-source-folder", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "write",
        actionKey: "ae_50140_google_drive_get_files_from_folder_custom",
        connection: "google-drive",
        inputs: { folderId: SOURCE_FOLDER_ID },
      }),
    );

    const files = (listing.data ?? []) as DriveFile[];
    const images = files.filter(
      (file) =>
        typeof file.id === "string" &&
        typeof file.name === "string" &&
        typeof file.mimeType === "string" &&
        file.mimeType.startsWith(MIME_PREFIX),
    );

    if (images.length === 0) {
      return { skipped: true, reason: "no-image-files-in-source-folder" };
    }

    const results: Outcome[] = [];
    for (const file of images) {
      const newName = sizedName(file.name as string);

      const outcome = await ctx.step(
        `copy-resized-image-${file.id}`,
        async (): Promise<Outcome> => {
          try {
            const existing = await sdk.runAction({
              appKey: "google-drive",
              actionType: "search",
              actionKey: "file_v2",
              connection: "google-drive",
              inputs: {
                title: newName,
                folder: DESTINATION_FOLDER_ID,
                search_type: "exact",
              },
            });
            if (existing.data?.length) {
              return { status: "already-exists", name: newName };
            }

            const copy = await sdk.runAction({
              appKey: "google-drive",
              actionType: "write",
              actionKey: "copy_file",
              connection: "google-drive",
              inputs: {
                file: file.id,
                new_name: newName,
                folder: DESTINATION_FOLDER_ID,
                convert: "false",
              },
            });
            return {
              status: "copied",
              name: newName,
              id: (copy.data?.[0] as { id?: string } | undefined)?.id ?? null,
            };
          } catch (error) {
            return { status: "failed", name: newName, error: String(error) };
          }
        },
      );

      results.push(outcome);
    }

    const count = (status: string) =>
      results.filter((result) => result.status === status).length;

    return {
      sourceImages: images.length,
      copied: count("copied"),
      alreadyExisted: count("already-exists"),
      failed: count("failed"),
      results,
    };
  },
);

export default workflow;
