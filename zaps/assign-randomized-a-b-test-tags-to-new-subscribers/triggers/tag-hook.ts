// What starts the zap: a subscriber added to a Kit tag. workflow.ts assigns each one to group A or B.
export default {
  app: "kit",
  event: "tagHook",
  connection: "kit",
  params: {
    // Ask the user which Kit tag marks new subscribers who should enter the test, then look up its ID with their Kit connection. Must differ from TAG_A_ID and TAG_B_ID.
    id: "REPLACE_TRIGGER_TAG_ID",
  },
};
