const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const { google } = require("googleapis");
const { generateText } = require("../controllers/geminiAPIController");
const { sendAutomatedReply } = require("../controllers/sendMail");
require("dotenv").config();

const googleOauthRouter = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

googleOauthRouter.get("/auth/google", (req, res) => {
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.labels",
    ],
  });
  res.redirect(authUrl);
});

googleOauthRouter.get("/auth/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await client.getToken(code);
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
      return res
        .status(401)
        .send("Authentication tokens not found. Please login again.");
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 1,
    });

    const latestMessage = response.data.messages[0];
    if (!latestMessage) {
      return res.status(404).send("No emails found.");
    }

    const email = await gmail.users.messages.get({
      userId: "me",
      id: latestMessage.id,
      format: "full",
      q: "is:unread",
    });

    const headers = email.data.payload.headers;
    const senderHeader = headers.find((header) => header.name === "From").value;
    const senderRegex = /(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/;
    const [, senderName, senderEmail] = senderHeader.match(senderRegex);
    const sender = senderEmail;
    const receivedTime = new Date(parseInt(email.data.internalDate));
    const messageBody = email.data.snippet;

    const analyzedResponse = await generateText(
      `Instructions:
1. Read the email content carefully.
2. Based on the content, categorize the email into one of the following categories:
   - Interested: If the email indicates interest or positive sentiment towards the content.
   - Not Interested: If the email indicates disinterest or negative sentiment towards the content.
   - Need more Information: If the email requests further details or clarification.
3. Choose the appropriate category and provide a label accordingly.

Email Content:${messageBody}`
    );

    const label = classifyEmail(analyzedResponse);

    // const labelExists = await checkLabelExists(gmail, label);
    // if (!labelExists) {
    //   await createLabel(gmail, label);
    // }

    // // Changing label of the email
    // const labelChanges = { addLabelIds: [label], removeLabelIds: ["INBOX"] };
    // await gmail.users.messages.modify({
    //   userId: "me",
    //   id: latestMessage.id,
    //   resource: labelChanges,
    // });

    let replyText;

    // Determine reply text based on category
    switch (label) {
      case "Interested":
        replyText = await generateText(
          "As the user is interested, your reply should ask them if they are willing to hop on to a demo call by suggesting a time from your end. Write a small text on above request in around 70-90 words. Please note that provide some real timeslots (use GMT as default) instead of option1, option2, dont inlcude hi(welcoming message) and best regards(end message)"
        );
        break;
      case "Not Interested":
        replyText = await generateText(
          "As the user is not interested, thank him for spending time to read the mail."
        );
        break;
      case "Need more Information":
        replyText = await generateText(
          "The user needs more information on the product, ask whether they can provide more inforamtion."
        );
        break;
      default:
        replyText = "Thank you for your message.";
        break;
    }

    // Send automated reply if necessary
    if (replyText) {
      await sendAutomatedReply(tokens, sender, replyText);
    }

    res.json({
      sender,
      messageBody,
      analyzedResponse,
      label,
      replyText,
    });
  } catch (error) {
    console.error("Error fetching latest email:", error);
    res.status(500).send("An error occurred while fetching the latest email.");
  }
});

// async function checkLabelExists(gmail, labelName) {
//   const labels = await gmail.users.labels.list({ userId: "me" });
//   return labels.data.labels.some((label) => label.name === labelName);
// }

// async function createLabel(gmail, labelName) {
//   await gmail.users.labels.create({
//     userId: "me",
//     requestBody: { name: labelName, labelListVisibility: "labelShow", messageListVisibility: "show" },
//   });
// }

// Function to classify email based on analyzed response
function classifyEmail(analyzedResponse) {
  if (analyzedResponse.includes("Interested")) {
    return "Interested";
  } else if (analyzedResponse.includes("Not Interested")) {
    return "Not Interested";
  } else if (analyzedResponse.includes("Need more Information")) {
    return "Need more Information";
  }
}

module.exports = { googleOauthRouter };
