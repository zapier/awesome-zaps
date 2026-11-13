// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const CREATE_TASK_URL = "REPLACE_CREATE_TASK_URL"; // Habit tracker endpoint that creates a habit task (POST).
export const SCORE_TASK_URL = "REPLACE_SCORE_TASK_URL"; // Habit tracker endpoint that scores a habit task. The new task's ID is appended as a path segment.
export const HABIT_TRACKER_TOKEN = "REPLACE_HABIT_TRACKER_TOKEN"; // Habit tracker API token, sent as a Bearer token on both requests.
