import { ask } from "zap-pack";

export const SOURCE_FOLDER_ID = ask(
  "Google Drive folder ID to watch for new build artifacts. Set the trigger's Folder to this same ID.",
);
export const RELEASE_FOLDER_ID = ask(
  "Google Drive folder ID where the timestamped copies are saved.",
);
