import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Entity type → Google Docs template document ID (the Paths branch). The key is the entity_type the webhook sends.
const TEMPLATE_IDS: Record<string, string> = {
  // Template for LLC funds.
  llc: "YOUR_LLC_TEMPLATE_DOC_ID",
  // Template for limited partnership funds.
  lp: "YOUR_LP_TEMPLATE_DOC_ID",
};
// Google Drive folder ID for new packets ("root" = top level of My Drive).
const COMPLIANCE_FOLDER = "YOUR_COMPLIANCE_FOLDER_ID";
// Slack channel ID to post the notification to.
const SLACK_CHANNEL = "YOUR_SLACK_CHANNEL_ID";
// Sharing for the new packet: "reader" = anyone with the link can view.
const SHARING_PREFERENCE = "reader";
// Set to true to @-mention the reviewer group in the Slack message.
const MENTION_REVIEWERS = false;
// Slack user-group mention for the reviewers; used only when MENTION_REVIEWERS is true.
const REVIEWER_MENTION = "<!subteam^YOUR_USERGROUP_ID>";

const InputSchema = z
  .object({
    fund_name: z.string(),
    entity_type: z.string(),
    ein: z.string().nullable().optional(),
    formation_date: z.string().nullable().optional(),
    registration_number: z.string().nullable().optional(),
    gp_name: z.string().nullable().optional(),
    gp_details: z.string().nullable().optional(),
    owner: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-kyc-packet-and-post-notification-to-channel",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const entityType = input.entity_type.trim().toLowerCase();
    const templateId = TEMPLATE_IDS[entityType];
    if (!templateId) {
      return {
        skipped: true,
        reason: "no-template-for-entity-type",
        entityType,
      };
    }

    const packetDate = await ctx.step("capture-packet-date", async () =>
      new Date().toISOString().slice(0, 10),
    );

    const document = await ctx.step(
      "create-kyc-document-from-template",
      async () =>
        sdk.runAction({
          appKey: "google-docs",
          actionType: "write",
          actionKey: "create_from_template",
          connection: "google-docs",
          inputs: {
            file: templateId,
            title: `${input.fund_name} KYC packet`,
            folder: COMPLIANCE_FOLDER,
            sharing_preference: SHARING_PREFERENCE,
            export_formats: ["pdf"],
            empty_fields_preference: "keep",
            EIN: input.ein ?? "",
            formation_date: input.formation_date ?? "",
            registration_info: input.registration_number ?? "",
            fund_name: input.fund_name,
            gp_details: input.gp_details ?? input.gp_name ?? "",
            date: packetDate,
          },
        }),
    );

    const packet = document.data[0];
    const docLink = packet?.alternateLink ?? "";
    const pdfLink = packet?.exportLinks?.["application/pdf"] ?? "";
    const text = [
      MENTION_REVIEWERS ? REVIEWER_MENTION : null,
      `KYC packet ready: ${input.fund_name} (${entityType.toUpperCase()})`,
      input.owner ? `Owner: ${input.owner}` : null,
      `Document: ${docLink}`,
      pdfLink ? `PDF: ${pdfLink}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const notification = await ctx.step(
      "post-kyc-notification-to-channel",
      async () =>
        sdk.runAction({
          appKey: "slack",
          actionType: "write",
          actionKey: "channel_message",
          connection: "slack",
          inputs: {
            channel: SLACK_CHANNEL,
            text,
            link_names: MENTION_REVIEWERS ? "yes" : "no",
            add_edit_link: "no",
          },
        }),
    );

    return {
      fundName: input.fund_name,
      entityType,
      documentId: packet?.id ?? null,
      notification: notification.data?.[0] ?? null,
    };
  },
);

export default workflow;
