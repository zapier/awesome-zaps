import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// HubSpot File Manager folder ID of the knowledge-base folder to index.
const KB_PARENT_FOLDER_ID = "YOUR_KB_PARENT_FOLDER_ID";
// Zapier Tables table ID that holds one record per knowledge-base file.
const TABLE_ID = "YOUR_TABLE_ID";
// Table field key for the file's public URL. This is also the dedupe key.
const URL_FIELD = "YOUR_URL_FIELD_KEY";
// Table field key for the file name, written to the record's title field.
const TITLE_FIELD = "YOUR_TITLE_FIELD_KEY";
// Table field key for the notes column.
const NOTES_FIELD = "YOUR_NOTES_FIELD_KEY";
// Text written to the notes column of each new record.
const NOTES_TEXT = "Indexed by hourly knowledge-base scan";

const workflow = defineDurable<unknown, unknown>(
  "create-knowledge-base-file-records-for-support-reference",
  async (ctx) => {
    const listing = await ctx.step("list-kb-files", async () => {
      const response = await sdk.fetch(
        `https://api.hubapi.com/files/v3/files/search?parentFolderIds=${KB_PARENT_FOLDER_ID}&limit=100`,
        { connection: "hubspot", method: "GET" },
      );
      if (!response.ok) {
        throw new Error(`HubSpot returned ${response.status}`);
      }
      const body = (await response.json()) as {
        results?: Array<{ id: string; name: string; url?: string | null }>;
      };
      return (body.results ?? []).map((file) => ({
        id: file.id,
        name: file.name,
        url: file.url ?? null,
      }));
    });

    const files = listing.filter(
      (file): file is typeof file & { url: string } => Boolean(file.url),
    );
    if (files.length === 0) {
      return { skipped: true, reason: "no-files-with-url" };
    }

    const results = await Promise.all(
      files.map(async (file, index) => {
        const found = await ctx
          .step(`find-table-record-${index}`, async () =>
            sdk.runAction({
              appKey: "zapier-tables",
              actionType: "search",
              actionKey: "find_record",
              connection: "zapier-tables",
              inputs: {
                table_id: TABLE_ID,
                filter_count: "1",
                field_data_key: URL_FIELD,
                operator: "exact",
                lookup_value: file.url,
              },
            }),
          )
          .catch((error: unknown) => ({
            failed: true as const,
            reason: String(error),
          }));
        if ("failed" in found) {
          return { file: file.name, status: "failed", reason: found.reason };
        }
        if (found.data.length > 0) {
          return { file: file.name, status: "duplicate" };
        }

        const created = await ctx
          .step(`create-table-record-${index}`, async () =>
            sdk.runAction({
              appKey: "zapier-tables",
              actionType: "write",
              actionKey: "create_record",
              connection: "zapier-tables",
              inputs: {
                table_id: TABLE_ID,
                [URL_FIELD]: file.url,
                [TITLE_FIELD]: file.name,
                [NOTES_FIELD]: NOTES_TEXT,
              },
            }),
          )
          .catch((error: unknown) => ({
            failed: true as const,
            reason: String(error),
          }));
        if ("failed" in created) {
          return { file: file.name, status: "failed", reason: created.reason };
        }
        return { file: file.name, status: "created" };
      }),
    );

    return {
      files: files.length,
      created: results.filter((r) => r.status === "created").length,
      duplicates: results.filter((r) => r.status === "duplicate").length,
      failed: results.filter((r) => r.status === "failed"),
    };
  },
);

export default workflow;
