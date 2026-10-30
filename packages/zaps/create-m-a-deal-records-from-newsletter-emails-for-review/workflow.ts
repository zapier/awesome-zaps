import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table ID that receives one record per deal. Create the table with
// the six columns Seller, Buyer, Deal Description, Date, Advisor, Deal Reference.
const TABLE_ID = "YOUR_TABLE_ID";
// Slack channel ID for the team summary (the long ID shown in the channel's details).
const SLACK_CHANNEL = "YOUR_SLACK_CHANNEL_ID";
// Set to true to @channel-mention the team in the summary. Keep false until you want pings.
const MENTION_CHANNEL = false;
// Text in front of the Slack summary. "[install-test] " marks test messages; set to "" for real use.
const MESSAGE_PREFIX = "[install-test] ";
// Most deals taken from one newsletter.
const MAX_DEALS = 10;

const InputSchema = z
  .object({
    subject: z.string().nullable().optional(),
    body: z.string().nullable().optional(),
  })
  .loose();

const DealSchema = z.object({
  seller: z.string().nullable().optional(),
  buyer: z.string().nullable().optional(),
  deal_description: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  advisor: z.string().nullable().optional(),
  deal_number: z.string().nullable().optional(),
});
type Deal = z.infer<typeof DealSchema>;

const workflow = defineDurable<unknown, unknown>(
  "create-m-a-deal-records-from-newsletter-emails-for-review",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const body = input.body ?? "";
    if (!body.trim()) {
      return { skipped: true, reason: "empty-body" };
    }

    const extraction = await ctx.step("extract-deals-from-email", async () =>
      sdk.runAction({
        appKey: "ai",
        actionType: "write",
        actionKey: "get_completion",
        inputs: {
          model_id: "standard/auto",
          authentication_id: "0",
          includeWorkflowData: false,
          instructions:
            "From the newsletter email in inputFields, list every M&A deal it mentions. For each deal return seller, buyer, deal_description, date (as written in the email), advisor (blank if none is named), and deal_number (blank if none). Return an empty list if the email mentions no deals. Do not invent details.",
          inputFields: { subject: input.subject ?? "", email: body },
          isOutputArray: true,
          outputFields: [
            {
              name: "seller",
              type: "text",
              isRequired: false,
              description: "Company selling",
            },
            {
              name: "buyer",
              type: "text",
              isRequired: false,
              description: "Company buying",
            },
            {
              name: "deal_description",
              type: "text",
              isRequired: false,
              description: "What the deal is",
            },
            {
              name: "date",
              type: "text",
              isRequired: false,
              description: "Deal date as written",
            },
            {
              name: "advisor",
              type: "text",
              isRequired: false,
              description: "Advisor, if named",
            },
            {
              name: "deal_number",
              type: "text",
              isRequired: false,
              description: "Deal number, if given",
            },
          ],
        },
      }),
    );

    const extracted = extraction.data[0] as { result?: unknown } | undefined;
    const { items } = z
      .object({ items: z.array(DealSchema) })
      .parse(extracted?.result ?? { items: [] });
    const deals = items.slice(0, MAX_DEALS);
    if (deals.length === 0) {
      return { skipped: true, reason: "no-deals-found" };
    }

    const created: Deal[] = [];
    const failures: number[] = [];
    for (const [index, deal] of deals.entries()) {
      try {
        await ctx.step(`create-deal-record-${index}`, async () =>
          sdk.runAction({
            appKey: "zapier-tables",
            actionType: "write",
            actionKey: "create_record",
            connection: "zapier-tables",
            inputs: {
              table_id: TABLE_ID,
              new__data__f1: deal.seller ?? "",
              new__data__f2: deal.buyer ?? "",
              new__data__f3: deal.deal_description ?? "",
              new__data__f4: deal.date ?? "",
              new__data__f5: deal.advisor ?? "",
              new__data__f6: deal.deal_number ?? "",
            },
          }),
        );
        created.push(deal);
      } catch {
        failures.push(index);
      }
    }

    if (created.length === 0) {
      return {
        skipped: true,
        reason: "no-new-records",
        failures: failures.length,
      };
    }

    const mention = MENTION_CHANNEL ? "<!channel> " : "";
    const lines = created.map(
      (deal) =>
        `• ${deal.buyer ?? "?"} bought from ${deal.seller ?? "?"} (${deal.date ?? "no date"})`,
    );
    const text = `${mention}${MESSAGE_PREFIX}${created.length} new M&A deal record(s) for review:\n${lines.join("\n")}`;

    await ctx.step("post-deal-summary", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL,
          text,
          link_names: MENTION_CHANNEL ? "yes" : "no",
          add_edit_link: "no",
          unfurl: "no",
        },
      }),
    );

    return { created: created.length, failures: failures.length };
  },
);

export default workflow;
