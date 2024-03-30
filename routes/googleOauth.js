const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const { google } = require("googleapis");
const { analyzeEmails } = require("../controllers/openAiController");
require("dotenv").config();

const googleOauthRouter = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

googleOauthRouter.get("/auth/google", (req, res) => {
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
  });
  res.redirect(authUrl);
});

googleOauthRouter.get("/auth/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await client.getToken(code);
    // Storing tokens securely in the session for further usage.
    req.session.tokens = tokens;
    res.send("Authentication successful!");
  } catch (error) {
    console.error("Error during OAuth callback:", error);
    res.status(500).send("An error occurred during authentication.");
  }
});

googleOauthRouter.get("/fetch-emails", async (req, res) => {
  try {
    const tokens = req.session.tokens;
    if (!tokens) {
      return res.status(401).send("Authentication tokens not found.");
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const response = await gmail.users.messages.list({
      userId: "me",
    });

    const messages = response.data.messages;
    const emails = [];

    for (const message of messages) {
      const email = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
        maxResults: 10,
      });

      // Extracting necessary information.
      const headers = email.data.payload.headers;
      const sender = headers.find((header) => header.name === "From").value;
      const receivedTime = new Date(parseInt(email.data.internalDate));
      const messageBody = email.data.snippet;

      // Analyzing the email using OpenAI
      let response = await analyzeEmails(
        `I want you to serve as a professional email classifier, this is the body of the email  "${messageBody}", carefully analyze the email content to determine the intent behind the message.`
      );
      res.json(response);
    }

    res.json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).send("An error occurred while fetching emails.");
  }
});

module.exports = { googleOauthRouter };
