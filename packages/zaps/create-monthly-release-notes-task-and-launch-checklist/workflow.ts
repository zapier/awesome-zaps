import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

import {
  WORKSPACE_ID,
  PROJECT_ID,
  TEMPLATE_ID,
  SECTION_NAME,
  OWNER_ID,
  TASK_NAME_PREFIX,
} from "@/config";
import asana from "@/connections/asana";

const sdk = createZapierSdk();

// Day of the month the subtask is due (date only).
const SUBTASK_DUE_DAY = 5;

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
const pad = (value: number) => String(value).padStart(2, "0");

const workflow = defineDurable<unknown, unknown>(
  "create-monthly-release-notes-task-and-launch-checklist",
  async (ctx) => {
    const runAt = await ctx.step("capture-run-date", async () =>
      new Date().toISOString(),
    );
    const runDate = new Date(runAt);
    const monthIndex = runDate.getUTCMonth();
    const monthName = MONTHS[monthIndex];
    const year = runDate.getUTCFullYear();
    const taskName = `${TASK_NAME_PREFIX} ${monthName} ${year}`;
    const subtaskDueDate = `${year}-${pad(monthIndex + 1)}-${pad(SUBTASK_DUE_DAY)}`;

    const existing = await ctx.step("find-existing-release-task", async () =>
      sdk.runAction({
        appKey: "asana",
        actionType: "search",
        actionKey: "find_task_v3",
        connection: asana,
        inputs: {
          name: taskName,
          project: [PROJECT_ID],
          workspace: WORKSPACE_ID,
        },
      }),
    );
    const duplicate = existing.data.find(
      (task) => (task as { name?: string }).name === taskName,
    );
    if (duplicate) {
      return { skipped: true, reason: "task-already-exists", taskName };
    }

    const created = await ctx.step(
      "create-release-task-from-template",
      async () =>
        sdk.runAction({
          appKey: "asana",
          actionType: "write",
          actionKey: "create_task_from_template",
          connection: asana,
          inputs: {
            name: taskName,
            workspace: WORKSPACE_ID,
            project_id: PROJECT_ID,
            template_id: TEMPLATE_ID,
          },
        }),
    );
    const task = created.data[0] as { gid: string };

    const section = await ctx.step("find-recurring-emails-section", async () =>
      sdk.runAction({
        appKey: "asana",
        actionType: "search",
        actionKey: "find_section",
        connection: asana,
        inputs: {
          name: SECTION_NAME,
          project: PROJECT_ID,
          workspace: WORKSPACE_ID,
        },
      }),
    );
    const sectionRow = section.data[0] as { id: number } | undefined;
    if (!sectionRow) {
      return { skipped: true, reason: "section-not-found", taskGid: task.gid };
    }

    await ctx.step("add-task-to-recurring-emails-section", async () =>
      sdk.runAction({
        appKey: "asana",
        actionType: "write",
        actionKey: "add_task_to_section",
        connection: asana,
        inputs: {
          section: String(sectionRow.id),
          task_id: task.gid,
          projects: PROJECT_ID,
          workspace: WORKSPACE_ID,
        },
      }),
    );

    const subtask = await ctx.step("create-send-date-subtask", async () =>
      sdk.runAction({
        appKey: "asana",
        actionType: "write",
        actionKey: "create_subtask_v3",
        connection: asana,
        inputs: {
          name: `Determine newsletter send date for ${monthName} ${year}`,
          task_id: task.gid,
          workspace: WORKSPACE_ID,
          assignee: OWNER_ID,
          dueType: "on",
          dueDate: subtaskDueDate,
        },
      }),
    );

    return {
      taskName,
      taskGid: task.gid,
      subtaskGid:
        (subtask.data[0] as { gid?: string } | undefined)?.gid ?? null,
    };
  },
);

export default workflow;
