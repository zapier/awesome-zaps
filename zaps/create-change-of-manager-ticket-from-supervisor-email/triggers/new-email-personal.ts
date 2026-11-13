// What starts the zap: a new email in the Outlook folder that receives supervisor requests.
export default {
  app: "microsoft-outlook",
  event: "new_email_personal",
  connection: "microsoft-outlook",
  params: {
    // Ask the user which Outlook folder receives the supervisor emails about manager changes, then look up its ID with their Microsoft Outlook connection.
    parentFolder: "REPLACE_HR_FOLDER_ID",
  },
};
