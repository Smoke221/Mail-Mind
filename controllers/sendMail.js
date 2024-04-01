const { google } = require("googleapis");
require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

async function sendAutomatedReply(tokens, sender, replyText) {
  try {
    // Set the credentials using the provided tokens
    oauth2Client.setCredentials(tokens);

    const message =
      `To: ${sender}\r\n` +
      `Subject: Automated Reply\r\n` +
      `\r\n` +
      `${replyText}`;
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });
    console.log("Automated reply sent:", res.data);
  } catch (error) {
    console.error("Error sending automated reply:", error);
  }
}

module.exports = { sendAutomatedReply };
