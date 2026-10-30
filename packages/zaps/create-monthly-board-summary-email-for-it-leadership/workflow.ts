import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

const sdk = createZapierSdk();

// Trello board to summarize (the ID in the board's URL, or from the board dropdown).
const TRELLO_BOARD_ID = "YOUR_TRELLO_BOARD_ID";
// Most cards to include in the summary, taken from the open cards on the board.
const MAX_CARDS = 200;
// Address the summary is emailed to (a leadership alias or the board owner).
const RECIPIENT_EMAIL = "YOUR_LEADERSHIP_EMAIL";
// Sender name shown on the email.
const FROM_NAME = "IT Leadership Board Summary";
// Text added in front of the email subject. Leave empty for production.
const SUBJECT_PREFIX = "";

type TrelloCard = {
  name?: string | null;
  url?: string | null;
  list?: { name?: string | null } | null;
  dateLastActivity?: string | null;
};

const workflow = defineDurable<unknown, unknown>(
  "create-monthly-board-summary-email-for-it-leadership",
  async (ctx) => {
    const cardsResult = await ctx.step("find-open-trello-cards", async () =>
      sdk.runAction({
        appKey: "trello",
        actionType: "search",
        actionKey: "organization_card_v2",
        connection: "trello",
        inputs: {
          board: TRELLO_BOARD_ID,
          open_cards_only: "true",
          cards_limit: MAX_CARDS,
          limited_fields: "false",
        },
      }),
    );

    const cards = ((cardsResult.data ?? []) as TrelloCard[]).slice(
      0,
      MAX_CARDS,
    );

    // One line per card: title, status (its list), last activity date, link.
    const lines = cards.map((card) => {
      const status = card.list?.name ?? "No list";
      const activity = card.dateLastActivity
        ? card.dateLastActivity.slice(0, 10)
        : "No activity date";
      return `- ${card.name ?? "Untitled card"} | Status: ${status} | Last activity: ${activity} | ${card.url ?? "No link"}`;
    });

    const body = [
      `Open cards on the board: ${cards.length}`,
      "",
      ...(lines.length ? lines : ["No open cards."]),
    ].join("\n");

    const email = await ctx.step("email-board-summary", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: [RECIPIENT_EMAIL],
          subject: `${SUBJECT_PREFIX}Monthly board summary: ${cards.length} open cards`,
          body,
          body_type: "plain",
          from_name: FROM_NAME,
        },
      }),
    );

    return { cardCount: cards.length, email: email.data?.[0] ?? null };
  },
);

export default workflow;
