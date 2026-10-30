import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Notion data source (database) that holds the design records. Find it in the database's "..." menu, or from its URL.
const NOTION_DATA_SOURCE_ID = "YOUR_NOTION_DATA_SOURCE_ID";
// Title property on the design records. The uploaded file's name, without its extension, must match this.
const NOTION_TITLE_PROPERTY = "Name";
// URL property on the design record that receives the Dropbox share link.
const NOTION_DOWNLOAD_URL_PROPERTY = "Download URL";

const InputSchema = z
  .object({
    file_name: z.string(),
    path: z.string().nullable().optional(),
    share_link: z.string().nullable().optional(),
  })
  .loose();

// Parses the Notion query response; the raw request returns the API body as text. Shape unverified until the first test run.
function firstPageId(found: unknown): string | null {
  const body = JSON.parse(
    String((found as { data: { body: string }[] }).data[0].body),
  );
  return body.results?.[0]?.id ?? null;
}

const workflow = defineDurable<unknown, unknown>(
  "update-design-records-with-new-render-file-download-links",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const shareLink = input.share_link ?? null;
    if (!shareLink) {
      return { skipped: true, reason: "no-share-link", file: input.file_name };
    }

    // Match on the file name without its extension. Records are never created here: an unmatched upload is returned for manual review.
    const title = input.file_name.replace(/\.[^.]+$/, "");

    const found = await ctx.step("find-design-record", async () =>
      sdk.runAction({
        appKey: "notion",
        actionType: "write",
        actionKey: "_zap_raw_request",
        connection: "notion",
        inputs: {
          url: `https://api.notion.com/v1/data_sources/${NOTION_DATA_SOURCE_ID}/query`,
          method: "POST",
          body: JSON.stringify({
            filter: {
              property: NOTION_TITLE_PROPERTY,
              title: { equals: title },
            },
          }),
          fail_on_errors: "true",
        },
      }),
    );

    const pageId = firstPageId(found);
    if (!pageId) {
      return { skipped: true, reason: "no-matching-record", title };
    }

    await ctx.step("write-download-link", async () =>
      sdk.runAction({
        appKey: "notion",
        actionType: "write",
        actionKey: "_zap_raw_request",
        connection: "notion",
        inputs: {
          url: `https://api.notion.com/v1/pages/${pageId}`,
          method: "PATCH",
          body: JSON.stringify({
            properties: { [NOTION_DOWNLOAD_URL_PROPERTY]: { url: shareLink } },
          }),
          fail_on_errors: "true",
        },
      }),
    );

    return { skipped: false, title, pageId, shareLink };
  },
);

export default workflow;
