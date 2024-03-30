const express = require("express");
const passport = require("passport");
const OutlookStrategy = require("passport-outlook").Strategy;
require("dotenv").config();

const outlookOauthRouter = express.Router();

passport.use(
  new OutlookStrategy(
    {
      clientID: process.env.OUTLOOK_CLIENT_ID,
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      callbackURL: process.env.OUTLOOK_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("Access Token:", accessToken);
      console.log("Refresh Token:", refreshToken);
      console.log("Profile:", profile);
      return done(null, profile);
    }
  )
);

// Serialize and Deserialize functions to encounter the issue I had while fetching for the first time.
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
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
    res.redirect("/");
  }
);

module.exports = { outlookOauthRouter };
