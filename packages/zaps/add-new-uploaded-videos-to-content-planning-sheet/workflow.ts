import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Drive folder ID of the staging folder (the last part of the folder's URL).
const STAGING_FOLDER_ID = "YOUR_STAGING_FOLDER_ID";
// Google Sheets spreadsheet ID (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Column for the sheet title; the file name is matched here and written here.
const TITLE_COLUMN = "COL$A";
// Column for the upload timestamp.
const UPLOADED_AT_COLUMN = "COL$B";
// Column for the link to the file.
const FILE_LINK_COLUMN = "COL$C";
// Only files whose MIME type starts with this prefix are logged.
const MIME_PREFIX = "video/";

const InputSchema = z
  .object({
    name: z.string().nullable().optional(),
    mimeType: z.string().nullable().optional(),
    createdTime: z.string().nullable().optional(),
    webViewLink: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "add-new-uploaded-videos-to-content-planning-sheet",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const fileName = (input.name ?? "").trim();
    const isVideo = (input.mimeType ?? "").startsWith(MIME_PREFIX);

    if (!fileName || !isVideo) {
      return { skipped: true, reason: "not-a-video", fileName };
    }

    const lookup = await ctx.step("find-existing-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "lookup_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          lookup_key: TITLE_COLUMN,
          lookup_value: fileName,
        },
      }),
    );

    if (lookup.data?.length) {
      return { skipped: true, reason: "row-already-exists", fileName };
    }

    const created = await ctx.step("create-sheet-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          [TITLE_COLUMN]: fileName,
          [UPLOADED_AT_COLUMN]: input.createdTime ?? "",
          [FILE_LINK_COLUMN]: input.webViewLink ?? "",
        },
      }),
    );

    return { fileName, row: created.data?.[0] ?? null };
  },
);

export default workflow;
