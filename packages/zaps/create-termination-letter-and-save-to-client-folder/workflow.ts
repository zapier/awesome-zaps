import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Docs template to copy (the document ID from its URL).
const TEMPLATE_DOC_ID = "YOUR_TEMPLATE_DOC_ID";
// Start of the new document's name; the practice, provider and time are appended.
const TITLE_PREFIX = "Termination letter";

const InputSchema = z
  .object({
    folder_path: z.string(),
    provider_name: z.string().nullable().optional(),
    practice_name: z.string().nullable().optional(),
    practice_address: z.string().nullable().optional(),
    credential_ref: z.string().nullable().optional(),
    tax_ref: z.string().nullable().optional(),
    termination_date: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-termination-letter-and-save-to-client-folder",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const folderId = input.folder_path
      .split("/folders/")
      .pop()!
      .split(/[/?#]/)[0];

    const dates = await ctx.step("capture-letter-date", async () => {
      const now = new Date();
      return {
        today: now.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        stamp: now.toISOString(),
      };
    });

    const providerName = input.provider_name ?? "";
    const practiceName = input.practice_name ?? "";
    const title =
      `${TITLE_PREFIX} - ${practiceName} - ${providerName} - ${dates.stamp}`
        .replace(/ - +/g, " - ")
        .trim();

    const letter = await ctx.step("create-termination-letter", async () =>
      sdk.runAction({
        appKey: "google-docs",
        actionType: "write",
        actionKey: "create_from_template",
        connection: "google-docs",
        inputs: {
          file: TEMPLATE_DOC_ID,
          title,
          folder: folderId,
          empty_fields_preference: "keep",
          template_field__termination_date:
            input.termination_date ?? dates.today,
          template_field__provider_name: providerName,
          template_field__practice_name: practiceName,
          template_field__practice_address: input.practice_address ?? "",
          template_field__credential_ref: input.credential_ref ?? "",
          template_field__tax_ref: input.tax_ref ?? "",
        },
      }),
    );

    const doc = letter.data?.[0] as
      { id?: string; alternateLink?: string } | undefined;
    return {
      title,
      folderId,
      documentId: doc?.id ?? null,
      documentUrl: doc?.alternateLink ?? null,
    };
  },
);

export default workflow;
