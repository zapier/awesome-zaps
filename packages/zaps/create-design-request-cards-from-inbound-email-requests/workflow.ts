import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Mail address name (the part before @zapiermail.com) that receives forwarded requests.
const MAIL_IDENTIFIER = "YOUR_ZAPIERMAIL_IDENTIFIER";
// Only emails whose subject matches this pattern become cards; everything else stops the run.
const SUBJECT_PATTERN = /design request/i;
// Trello board ID that holds the design project board.
const TRELLO_BOARD_ID = "YOUR_TRELLO_BOARD_ID";
// Trello intake list ID; new cards are placed at the bottom of this list.
const TRELLO_INTAKE_LIST_ID = "YOUR_TRELLO_INTAKE_LIST_ID";

const InputSchema = z
  .object({
    subject: z.string().nullable().optional(),
    body_html: z.string().nullable().optional(),
    body_plain: z.string().nullable().optional(),
    from_email: z.string().nullable().optional(),
    from_name: z.string().nullable().optional(),
    raw: z
      .object({
        Date: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function normalizeLineBreaks(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const MONTHS =
  "January|February|March|April|May|June|July|August|September|October|November|December";
const DUE_PATTERN = new RegExp(
  `\\b(?:due|deadline|needed by)[:\\s]+(\\d{4}-\\d{2}-\\d{2}|(?:${MONTHS})\\s+\\d{1,2},?\\s+\\d{4})`,
  "i",
);
const URL_PATTERN = /https?:\/\/[^\s<>"')]+/g;
const CONTACT_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+|\+?\d[\d\s().-]{7,}\d/g;
const BUDGET_PATTERN = /^.*\bbudget\b.*$/gim;

function extractDueDate(text: string): string | null {
  const match = text.match(DUE_PATTERN);
  if (!match) {
    return null;
  }
  const parsed = Date.parse(match[1]);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

function cardNameFromSubject(subject: string): string {
  return subject.replace(/^((re|fwd?):\s*)+/i, "").trim();
}

const workflow = defineDurable<unknown, unknown>(
  "create-design-request-cards-from-inbound-email-requests",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));
    const subject = input.subject ?? "";

    if (!SUBJECT_PATTERN.test(subject)) {
      return { skipped: true, reason: "not-a-design-request", subject };
    }

    const plainBody = normalizeLineBreaks(
      stripHtml(input.body_html ?? input.body_plain ?? ""),
    );
    const contacts = [...new Set(plainBody.match(CONTACT_PATTERN) ?? [])];
    const budgetLines = plainBody.match(BUDGET_PATTERN) ?? [];
    const links = [...new Set(plainBody.match(URL_PATTERN) ?? [])];
    const dueAt = extractDueDate(plainBody);

    const requester = input.from_name ?? input.from_email ?? "unknown sender";
    const cardName = cardNameFromSubject(subject) || "Design request";

    const receivedAt = await ctx.step(
      "capture-received-at",
      async () => input.raw?.Date ?? new Date().toISOString(),
    );

    const description = [
      `Received: ${receivedAt}`,
      `From: ${requester}${input.from_email ? ` <${input.from_email}>` : ""}`,
      "",
      plainBody,
      contacts.length ? `\nContact: ${contacts.join(", ")}` : null,
      budgetLines.length ? `\nBudget: ${budgetLines.join(" ")}` : null,
      links.length
        ? `\nLinks:\n${links.map((link) => `- ${link}`).join("\n")}`
        : null,
    ]
      .filter((part) => part !== null)
      .join("\n");

    const existing = await ctx.step("find-matching-card", async () =>
      sdk.runAction({
        appKey: "trello",
        actionType: "search",
        actionKey: "organization_card_v2",
        connection: "trello",
        inputs: {
          board: TRELLO_BOARD_ID,
          keyword: cardName,
          open_cards_only: "true",
          cards_limit: "50",
        },
      }),
    );

    const duplicate = existing.data.find(
      (card) => card.name === cardName && card.desc?.includes(receivedAt),
    );
    if (duplicate) {
      return {
        skipped: true,
        reason: "card-already-exists",
        cardId: duplicate.id,
      };
    }

    const card = await ctx.step("create-design-request-card", async () =>
      sdk.runAction({
        appKey: "trello",
        actionType: "write",
        actionKey: "card_v2",
        connection: "trello",
        inputs: {
          board: TRELLO_BOARD_ID,
          list: TRELLO_INTAKE_LIST_ID,
          name: cardName,
          desc: description,
          card_pos: "bottom",
          ...(dueAt ? { due: dueAt } : {}),
        },
      }),
    );

    return { created: true, cardName, due: dueAt, card: card.data[0] ?? null };
  },
);

export default workflow;
