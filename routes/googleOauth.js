const express = require("express");
const { OAuth2Client } = require("google-auth-library");
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
  const { code } = req.query;
  const { tokens } = await client.getToken(code);
  // Store or handle tokens as needed
  res.send("Authentication successful!");
});

module.exports = { googleOauthRouter };
