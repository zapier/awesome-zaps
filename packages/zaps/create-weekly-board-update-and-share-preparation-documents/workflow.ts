import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

import {
  DESTINATION_FOLDER_ID,
  TEMPLATE_FILE_ID,
  DOC_NAME_PREFIX,
  BOARD_ITEM_ID,
} from "@/config";
import onedrive from "@/connections/onedrive";
import mondayConnection from "@/connections/monday";

const sdk = createZapierSdk();

const workflow = defineDurable<unknown, unknown>(
  "create-weekly-board-update-and-share-preparation-documents",
  async (ctx) => {
    const dates = await ctx.step("compute-week-dates", async () => {
      const now = new Date();
      const offsetToMonday = (now.getUTCDay() + 6) % 7;
      const monday = new Date(now);
      monday.setUTCDate(now.getUTCDate() - offsetToMonday);
      const friday = new Date(monday);
      friday.setUTCDate(monday.getUTCDate() + 4);
      const weekStart = monday.toISOString().slice(0, 10);
      const weekEnd = friday.toISOString().slice(0, 10);
      return {
        weekStart,
        weekEnd,
        deadline: `Friday ${weekEnd} end of business`,
        docName: `${DOC_NAME_PREFIX} - week of ${weekStart}`,
      };
    });

    const existing = await ctx.step("find-existing-dated-document", async () =>
      sdk.runAction({
        appKey: "onedrive",
        actionType: "search",
        actionKey: "file",
        connection: onedrive,
        inputs: { query: dates.docName },
      }),
    );

    let docId = existing.data.find((file) => file.name === dates.docName)?.id;
    let created = false;

    if (!docId) {
      const copy = await ctx.step("copy-template-to-dated-document", async () =>
        sdk.runAction({
          appKey: "onedrive",
          actionType: "write",
          actionKey: "copyFileOrFolder",
          connection: onedrive,
          inputs: {
            directory: TEMPLATE_FILE_ID,
            folder: DESTINATION_FOLDER_ID,
            newName: dates.docName,
            conflictBehavior: "fail",
          },
        }),
      );
      docId = copy.data[0]?.id;
      created = true;
    }

    if (!docId) {
      return {
        skipped: true,
        reason: "document-not-available",
        docName: dates.docName,
      };
    }

    const share = await ctx.step("create-edit-share-link", async () =>
      sdk.runAction({
        appKey: "onedrive",
        actionType: "write",
        actionKey: "shareLink",
        connection: onedrive,
        inputs: {
          directory: docId,
          type: "edit",
          retainInheritedPermissions: true,
        },
      }),
    );
    const link = share.data[0]?.url;

    const body = [
      `Board update for the week of ${dates.weekStart}: ${link}`,
      `Please add your updates to the document by ${dates.deadline}.`,
    ].join("\n");

    const update = await ctx.step("post-board-update", async () =>
      sdk.runAction({
        appKey: "monday",
        actionType: "write",
        actionKey: "create_update",
        connection: mondayConnection,
        inputs: {
          item_id: Number(BOARD_ITEM_ID),
          body,
        },
      }),
    );

    return {
      docName: dates.docName,
      docId,
      created,
      link,
      deadline: dates.deadline,
      update: update.data[0] ?? null,
    };
  },
);

export default workflow;
