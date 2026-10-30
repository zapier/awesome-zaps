import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Slides template presentation ID (the long ID in the template's URL). Every deck is copied from it.
const TEMPLATE_PRESENTATION_ID = "YOUR_TEMPLATE_PRESENTATION_ID";
// Zapier Tables table that holds the account and opportunity records.
const TABLE_ID = "YOUR_TABLE_ID";
// Table column key for the request identifier, used to find the matching record. Map it to your column.
const REQUEST_ID_FIELD = "new__data__f2";
// Table column key for the client name, written when a new record is created. Map it to your column.
const CLIENT_NAME_FIELD = "new__data__f1";
// Table column key for the record status, written when a new record is created. Map it to your column.
const STATUS_FIELD = "new__data__f3";
// Status written to a newly created record.
const NEW_RECORD_STATUS = "Deck requested";
// Share each new deck with anyone who has the link. Off keeps it visible only to the connected Google account.
const SHARE_DECK_WITH_LINK = false;

const InputSchema = z
  .object({
    submission_id: z.union([z.string(), z.number()]).nullable().optional(),
    id: z.union([z.string(), z.number()]).nullable().optional(),
    client_name: z.string().nullable().optional(),
    presentation_title: z.string().nullable().optional(),
    agenda: z.string().nullable().optional(),
    pricing_summary: z.string().nullable().optional(),
    next_steps: z.string().nullable().optional(),
  })
  .loose();

type TableRecord = {
  record_id?: string;
  old?: { data?: { f1?: string | null } };
};

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

// Formatter-style text cleanup: collapse whitespace and trim.
function cleanText(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

function titleCase(text: string): string {
  return text.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const workflow = defineDurable<unknown, unknown>(
  "create-tailored-sales-decks-from-incoming-request-webhook",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));
    const requestId = String(input.submission_id ?? input.id ?? "").trim();
    if (!requestId) {
      return { skipped: true, reason: "missing-request-id" };
    }

    // Storage keys are capped at 32 characters.
    const storageKey = `deck_${requestId}`.slice(0, 32);

    const seen = await ctx.step("check-storage-for-request", async () =>
      sdk.runAction({
        appKey: "storage",
        actionType: "search",
        actionKey: "get_value",
        connection: "storage",
        inputs: { key: storageKey },
      }),
    );
    if ((seen.data?.[0] as { id?: string } | undefined)?.id) {
      return { skipped: true, reason: "deck-already-created", requestId };
    }

    const lookup = await ctx.step("find-account-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TABLE_ID,
          filter_count: "1",
          use_stored_order: false,
          field_data_key: REQUEST_ID_FIELD,
          operator: "exact",
          lookup_value: requestId,
        },
      }),
    );
    let record = lookup.data?.[0] as TableRecord | undefined;

    const clientName = titleCase(
      cleanText(input.client_name ?? record?.old?.data?.f1 ?? ""),
    );

    if (!record?.record_id) {
      const created = await ctx.step("create-account-record", async () =>
        sdk.runAction({
          appKey: "zapier-tables",
          actionType: "write",
          actionKey: "create_record",
          connection: "zapier-tables",
          inputs: {
            table_id: TABLE_ID,
            [REQUEST_ID_FIELD]: requestId,
            [CLIENT_NAME_FIELD]: clientName,
            [STATUS_FIELD]: NEW_RECORD_STATUS,
          },
        }),
      );
      record = created.data?.[0] as TableRecord | undefined;
    }

    const deckDate = await ctx.step("capture-deck-date", async () =>
      new Date().toISOString().slice(0, 10),
    );
    const deckTitle =
      cleanText(input.presentation_title) || `${clientName} | ${deckDate}`;

    const deck = await ctx.step("create-slides-deck", async () =>
      sdk.runAction({
        appKey: "google-slides",
        actionType: "write",
        actionKey: "create_presentation_from_template",
        connection: "google-slides",
        inputs: {
          title: deckTitle,
          is_shared: SHARE_DECK_WITH_LINK,
          presentation_id: TEMPLATE_PRESENTATION_ID,
          client_name: clientName,
          agenda: cleanText(input.agenda),
          pricing_summary: cleanText(input.pricing_summary),
          next_steps: cleanText(input.next_steps),
        },
      }),
    );
    const deckId = (deck.data?.[0] as { id?: string } | undefined)?.id ?? null;

    // Store the request key only after the deck exists, so a failed run can be retried.
    await ctx.step("mark-request-handled", async () =>
      sdk.runAction({
        appKey: "storage",
        actionType: "write",
        actionKey: "set_value_if",
        connection: "storage",
        inputs: { key: storageKey, value: String(deckId ?? requestId) },
      }),
    );

    return {
      requestId,
      recordId: record?.record_id ?? null,
      deckId,
      deckTitle,
    };
  },
);

export default workflow;
