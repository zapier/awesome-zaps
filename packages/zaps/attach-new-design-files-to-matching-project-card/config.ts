import { ask } from "zap-pack";

export const DROPBOX_FOLDER = ask(
  'Dropbox folder to watch for new design files, as a path such as "/Design/CAD".',
);
export const TRELLO_BOARD_ID = ask(
  "Trello board to search for matching cards (the ID in the board's URL).",
);
