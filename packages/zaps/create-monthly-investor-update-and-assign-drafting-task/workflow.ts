import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

const sdk = createZapierSdk();

// Google Doc copied each month. Use the ID from its URL (docs.google.com/document/d/<ID>/edit). It needs a {{report_date}} placeholder.
const TEMPLATE_DOC_ID = "YOUR_TEMPLATE_DOC_ID";
// Drive folder ID for new documents. Use your folder's ID, or "root" for the top level of My Drive.
const DOC_FOLDER = "YOUR_FOLDER_ID";
// Your Google Workspace domain, used for the organization sharing setting.
const ORG_DOMAIN = "YOUR_ORG_DOMAIN";
// Prefix on new document, task and email titles. Empty for real use.
const TITLE_PREFIX = "";
// ClickUp workspace (team) ID, the number in the workspace URL.
const CLICKUP_WORKSPACE_ID = "YOUR_CLICKUP_WORKSPACE_ID";
// Email of the ClickUp user who gets the drafting task.
const DRAFTER_EMAIL = "YOUR_EMAIL@example.com";
// Addresses that get the ready email. Email by Zapier sends from zapiermail.com.
const COLLABORATOR_EMAILS = ["YOUR_COLLABORATOR_EMAIL@example.com"];
// Days after the run date that the drafting task is due.
const DUE_OFFSET_DAYS = 7;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const workflow = defineDurable<unknown, unknown>(
  "create-monthly-investor-update-and-assign-drafting-task",
  async (ctx) => {
    const when = await ctx.step("capture-run-details", async () => {
      const runAt = new Date();
      return {
        startedAt: runAt.toISOString(),
        label: `${MONTHS[runAt.getUTCMonth()]} ${runAt.getUTCFullYear()}`,
        dueAt: new Date(
          runAt.getTime() + DUE_OFFSET_DAYS * 86400000,
        ).toISOString(),
      };
    });
    const docTitle = `${TITLE_PREFIX}Investor update ${when.label}`;
    const taskTitle = `${TITLE_PREFIX}Draft investor update ${when.label}`;

    const created = await ctx.step("create-investor-update-doc", async () =>
      sdk.runAction({
        appKey: "google-docs",
        actionType: "write",
        actionKey: "create_from_template",
        connection: "google-docs",
        inputs: {
          file: TEMPLATE_DOC_ID,
          title: docTitle,
          folder: DOC_FOLDER,
          domain: ORG_DOMAIN,
          sharing_preference: "org_link_edit",
          empty_fields_preference: "keep",
          template_field__report_date: when.label,
        },
      }),
    );
    const doc = created.data[0];
    if (!doc?.alternateLink) {
      return { skipped: true, reason: "doc-not-created" };
    }

    const existing = await ctx.step("find-drafting-task", async () =>
      sdk.runAction({
        appKey: "clickup",
        actionType: "write",
        actionKey: "ae_39348_clickup_find_task_by_name_custom_action",
        connection: "clickup",
        inputs: { taskName: taskTitle, workspaceId: CLICKUP_WORKSPACE_ID },
      }),
    );

    if (existing.data.length === 0) {
      await ctx.step("create-drafting-task", async () =>
        sdk.runAction({
          appKey: "clickup",
          actionType: "write",
          actionKey: "task",
          connection: "clickup",
          inputs: {
            name: taskTitle,
            content: doc.alternateLink,
            team_id: Number(CLICKUP_WORKSPACE_ID),
            due_date: when.dueAt,
            start_date: when.startedAt,
            assignees: [DRAFTER_EMAIL],
          },
        }),
      );
    }

    const email = await ctx.step("email-collaborators", async () =>
      sdk.runAction({
        appKey: "email",
        actionType: "write",
        actionKey: "outbound",
        inputs: {
          to: COLLABORATOR_EMAILS.join(","),
          subject: `${docTitle} is ready`,
          body: `<p>The ${when.label} investor update is ready: <a href="${doc.alternateLink}">${docTitle}</a></p>`,
        },
      }),
    );

    return {
      docTitle,
      docLink: doc.alternateLink,
      taskTitle,
      taskExisted: existing.data.length > 0,
      emailed: COLLABORATOR_EMAILS,
      emailResult: email.data[0] ?? null,
    };
  },
);

export default workflow;
