// What starts the zap: each new Google review on the watched location.
export default {
  app: "google-business-profile",
  event: "new_review_v3",
  connection: "google-business-profile",
  params: {
    // Look up with the user's Google Business Profile connection the location whose reviews get replies, and confirm it with them.
    location: "REPLACE_LOCATION_ID",
  },
};
