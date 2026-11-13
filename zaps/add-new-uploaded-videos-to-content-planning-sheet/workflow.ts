import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  TITLE_COLUMN,
  UPLOADED_AT_COLUMN,
  FILE_LINK_COLUMN,
  MIME_PREFIX,
} from "./config.ts";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    name: z.string().nullable().optional(),
    mimeType: z.string().nullable().optional(),
    createdTime: z.string().nullable().optional(),
    webViewLink: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
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
