import { ask } from "zap-pack";

export const TRAINING_PROPERTY = ask(
  "HubSpot contact property holding the training status. The trigger watches it, and only its changes are processed.",
);
export const STATUS_FLAG_PROPERTY = ask(
  'HubSpot checkbox contact property that receives the normalized flag ("true" or "false").',
);
