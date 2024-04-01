const express = require("express");
const passport = require("passport");
const OutlookStrategy = require("passport-outlook").Strategy;
const axios = require("axios");
const { Client } = require('@microsoft/microsoft-graph-client');
const { DefaultAzureCredential } = require('@azure/identity');
require("dotenv").config();

const outlookOauthRouter = express.Router();

passport.use(
  new OutlookStrategy(
    {
      clientID: process.env.OUTLOOK_CLIENT_ID,
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      callbackURL: process.env.OUTLOOK_CALLBACK_URL,
      scope: ["openid", "profile", "offline_access", "https://outlook.office.com/Mail.Read"],
    },
    (accessToken, refreshToken, profile, done) => {
      // console.log("Access Token:", accessToken);
      // console.log("Refresh Token:", refreshToken);
      // console.log("Profile:", profile);
      return done(null, { accessToken, refreshToken, profile });
    }
  )
);

// Serialize and Deserialize functions
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Initialize the Microsoft Graph client
const credential = new DefaultAzureCredential();
const graphClient = Client.initWithMiddleware({
  authProvider: async (done) => {
    const token = await credential.getToken("https://graph.microsoft.com/.default");
    if (token) {
      done(null, token.token);
    } else {
      done(new Error("Could not retrieve token"));
    }
  }
});

outlookOauthRouter.get(
  "/auth/outlook",
  passport.authenticate("windowslive", {
    scope: [
      "openid",
      "profile",
      "offline_access",
      "https://outlook.office.com/Mail.Read",
    ],
  })
);

outlookOauthRouter.get(
  "/auth/outlook/callback",
  passport.authenticate("windowslive", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication.
    res.redirect("/fetch-outlook-email");
  }
);

outlookOauthRouter.get(
  "/fetch-outlook-email",
  passport.authenticate("windowslive", { session: false }),
  async (req, res) => {
    try {
      const { accessToken } = req.user;
      console.log((accessToken));

      const messages = await graphClient.api('/me/messages')
        .select('sender,subject')
        .get();
      
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching emails from Outlook:", error);
      res.status(500).send("An error occurred while fetching emails from Outlook.");
    }
  }
);

module.exports = { outlookOauthRouter };
