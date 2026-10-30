import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Drive folder that receives the word-list documents (the folder ID from its URL).
const WATCHED_FOLDER_ID = "YOUR_FOLDER_ID";
// Zapier Table that holds the synonym entries (the table ID).
const TABLE_ID = "YOUR_TABLE_ID";
// Table column that stores the term; existing entries are matched on it.
const TERM_COLUMN = "YOUR_TERM_COLUMN_KEY";
// Table column that stores the synonyms joined into one string.
const SYNONYMS_COLUMN = "YOUR_SYNONYMS_COLUMN_KEY";
// Thesaurus endpoint; each term is sent as the `word` query parameter.
const THESAURUS_URL = "https://YOUR_THESAURUS_API_URL";
// Most terms processed per document, so one large file cannot run away.
const MAX_WORDS = 50;
// Separator used to join synonyms into the table cell.
const SYNONYM_SEPARATOR = ", ";

const InputSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable().optional(),
  })
  .loose();

// One term per non-empty line, lowercased and de-duplicated.
function extractTerms(text: string): string[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(lines)].slice(0, MAX_WORDS);
}

const workflow = defineDurable<unknown, unknown>(
  "create-synonym-entries-from-document-word-list-into-cache",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const document = await ctx.step("get-document-content", async () =>
      sdk.runAction({
        appKey: "google-docs",
        actionType: "search",
        actionKey: "get_document_content",
        connection: "google-docs",
        inputs: { document_id: input.id },
      }),
    );

    const text =
      (document.data[0] as { content?: string } | undefined)?.content ?? "";
    const terms = extractTerms(text);
    if (terms.length === 0) {
      return { skipped: true, reason: "no-terms", document: input.id };
    }

    const results: { term: string; status: string }[] = [];

    for (const [index, term] of terms.entries()) {
      try {
        const existing = await ctx.step(`find-term-${index}`, async () =>
          sdk.runAction({
            appKey: "zapier-tables",
            actionType: "search",
            actionKey: "find_record",
            inputs: { table_id: TABLE_ID, [TERM_COLUMN]: term },
          }),
        );

        if (existing.data.length > 0) {
          results.push({ term, status: "exists" });
          continue;
        }

        const thesaurus = await ctx.step(`fetch-synonyms-${index}`, async () =>
          sdk.runAction({
            appKey: "webhook",
            actionType: "write",
            actionKey: "get",
            inputs: {
              url: THESAURUS_URL,
              data: { word: term },
              as_json: "yes",
            },
          }),
        );

        const payload = (
          thesaurus.data[0] as { json?: { synonyms?: string[] } } | undefined
        )?.json;
        const synonyms = (payload?.synonyms ?? [])
          .map((synonym) => synonym.trim())
          .filter(Boolean);

        await ctx.step(`create-term-${index}`, async () =>
          sdk.runAction({
            appKey: "zapier-tables",
            actionType: "write",
            actionKey: "create_record",
            inputs: {
              table_id: TABLE_ID,
              [TERM_COLUMN]: term,
              [SYNONYMS_COLUMN]: synonyms.join(SYNONYM_SEPARATOR),
            },
          }),
        );

        results.push({ term, status: "created" });
      } catch (error) {
        results.push({
          term,
          status: `failed: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    return {
      document: input.id,
      total: terms.length,
      created: results.filter((r) => r.status === "created").length,
      existing: results.filter((r) => r.status === "exists").length,
      failed: results.filter((r) => r.status.startsWith("failed")).length,
      results,
    };
  },
);

export default workflow;
