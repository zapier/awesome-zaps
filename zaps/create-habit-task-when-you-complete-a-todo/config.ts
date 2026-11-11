import { ask } from "zap-pack";

export const CREATE_TASK_URL = ask(
  "Habit tracker endpoint that creates a habit task (POST).",
);
export const SCORE_TASK_URL = ask(
  "Habit tracker endpoint that scores a habit task. The new task's ID is appended as a path segment.",
);
export const HABIT_TRACKER_TOKEN = ask(
  "Habit tracker API token, sent as a Bearer token on both requests.",
);
