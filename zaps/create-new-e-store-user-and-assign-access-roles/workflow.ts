import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  CUSTOMER_API_URL,
  DEFAULT_QUICK_START_URL,
  ONBOARDING_SUBJECT,
} from "./config.ts";

const sdk = createZapierSdk();

// Role label from the intake form → role ID in your customer platform. First match wins.
const ROLE_IDS: Record<string, string> = {
  "Store Admin": "REPLACE_STORE_ADMIN_ROLE_ID", // Ask the user for the customer platform's ID for the Store Admin role.
  "Store Staff": "REPLACE_STORE_STAFF_ROLE_ID", // Ask the user for the customer platform's ID for the Store Staff role.
};
// Quick start link per role label; DEFAULT_QUICK_START_URL is used when a role has no entry.
const QUICK_START_URLS: Record<string, string> = {
  "Store Admin": "REPLACE_ADMIN_QUICK_START_URL", // Ask the user for the onboarding guide link for Store Admin.
  "Store Staff": "REPLACE_STAFF_QUICK_START_URL", // Ask the user for the onboarding guide link for Store Staff.
};
// Ask the new user to reset the temporary password at first sign-in.
const REQUIRE_PASSWORD_RESET = true;

const InputSchema = z
  .object({
    name: z.string().nullable().optional(),
    email: z.string(),
    roles: z.array(z.string()).nullable().optional(),
    region: z.string().nullable().optional(),
  })
  .loose();

function generateTemporaryPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 20);
}

const workflow = defineDurable(
  "create-new-e-store-user-and-assign-access-roles",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const email = input.email.trim();
    const name = input.name ?? email;

    const roleLabel = (input.roles ?? []).find((role) => role in ROLE_IDS);
    if (!roleLabel) {
      return { skipped: true, reason: "no-matching-role", email };
    }
    const roleId = ROLE_IDS[roleLabel];

    const customer = await ctx.step("create-customer-record", async () => {
      const temporaryPassword = generateTemporaryPassword();
      const response = await sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: `${CUSTOMER_API_URL}/customers`,
          payload_type: "json",
          data: {
            name,
            email,
            active: true,
            password: temporaryPassword,
            require_password_reset: REQUIRE_PASSWORD_RESET,
          },
        },
      });
      const created = response.data[0] as { id?: string | number } | undefined;
      if (!created?.id) {
        throw new Error("customer platform returned no customer id");
      }
      return { customerId: String(created.id), temporaryPassword };
    });

    await ctx.step("assign-access-role", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: `${CUSTOMER_API_URL}/customers/${customer.customerId}/roles`,
          payload_type: "json",
          data: { role_id: roleId },
        },
      }),
    );

    const quickStartUrl =
      QUICK_START_URLS[roleLabel] ?? DEFAULT_QUICK_START_URL;
    const body = [
      `<p>Hi ${name},</p>`,
      `<p>Your store account is ready. Sign in with the temporary password below and you will be asked to choose a new one.</p>`,
      `<p><b>Temporary password:</b> ${customer.temporaryPassword}</p>`,
      `<p><a href="${quickStartUrl}">Quick start guide for ${roleLabel}</a></p>`,
    ].join("");

    await ctx.step("send-onboarding-email", async () =>
      sdk.runAction({
        appKey: "microsoft-outlook",
        actionType: "write",
        actionKey: "send_email",
        connection: "microsoft-outlook",
        inputs: {
          recipients: [email],
          subject: ONBOARDING_SUBJECT,
          bodyFormat: "HTML",
          body,
        },
      }),
    );

    return { customerId: customer.customerId, roleLabel, emailed: email };
  },
);

export default workflow;
