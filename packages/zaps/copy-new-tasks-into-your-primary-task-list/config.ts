import { ask } from "zap-pack";

export const SOURCE_TASK_LIST_ID = ask(
  "Google Tasks list to watch for new tasks. Use the same ID as the trigger's Task List.",
);
export const PRIMARY_TASK_LIST_ID = ask(
  "Google Tasks list (your primary inbox) that receives the copies.",
);
