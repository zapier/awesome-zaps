import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Dropbox folder to watch for new design files, as a path such as "/Design/CAD".
const DROPBOX_FOLDER = "YOUR_DROPBOX_FOLDER_PATH";
// Trello board to search for matching cards (the ID in the board's URL).
const TRELLO_BOARD_ID = "YOUR_TRELLO_BOARD_ID";

const InputSchema = z
  .object({
    filename: z.string().nullable().optional(),
    file: z.unknown().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "attach-new-design-files-to-matching-project-card",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const filename = input.filename ?? "";
    if (!filename) {
      return { skipped: true, reason: "no-filename" };
    }

    const search = await ctx.step("find-matching-card", async () =>
      sdk.runAction({
        appKey: "trello",
        actionType: "search",
        actionKey: "organization_card_v2",
        connection: "trello",
        inputs: {
          board: TRELLO_BOARD_ID,
          keyword: filename,
          limited_fields: "true",
        },
      }),
    );

    // Exact name match only; the search is a keyword search, so it can return near-misses.
    const card = search.data?.find(
      (item) => (item as { name?: string }).name === filename,
    ) as { id?: string } | undefined;
    if (!card?.id) {
      return { skipped: true, reason: "no-matching-card", filename };
    }

    const attachment = await ctx.step("attach-file-to-card", async () =>
      sdk.runAction({
        appKey: "trello",
        actionType: "write",
        actionKey: "card_attachment",
        connection: "trello",
        inputs: {
          card: card.id,
          file: input.file,
        },
      }),
    );

    return {
      filename,
      cardId: card.id,
      attached: attachment.data?.[0] ?? null,
    };
  },
);

export default workflow;
