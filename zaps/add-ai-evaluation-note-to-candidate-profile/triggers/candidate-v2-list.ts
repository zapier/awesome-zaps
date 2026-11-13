// What starts the zap: every new application in the Greenhouse account. workflow.ts skips other jobs.
export default {
  app: "greenhouse",
  event: "candidate_v2List",
  connection: "greenhouse",
  params: {},
};
