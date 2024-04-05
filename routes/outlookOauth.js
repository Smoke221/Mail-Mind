const express = require("express");
const passport = require("passport");
const session = require('express-session');
const cors = require("cors");
const OutlookStrategy = require("passport-outlook").Strategy;
const axios = require("axios");
const { Client } = require("@microsoft/microsoft-graph-client");
const { DefaultAzureCredential } = require("@azure/identity");
const {
  PublicClientApplication,
  ConfidentialClientApplication,
} = require("@azure/msal-node");
require("dotenv").config();

const outlookOauthRouter = express.Router();

// passport.use(
//   new OutlookStrategy(
//     {
//       clientID: process.env.OUTLOOK_CLIENT_ID,
//       clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
//       callbackURL: process.env.OUTLOOK_CALLBACK_URL,
//       scope: [
//         "openid",
//         "profile",
//         "offline_access",
//         "https://outlook.office.com/mail.read",
//       ],
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // Store access token in session
//       profile.accessToken = accessToken;
//       profile.refreshToken = refreshToken;
//       return done(null, profile);
//     }
//   )
// );

// // Serialize and Deserialize functions
// passport.serializeUser(function (user, done) {
//   done(null, user);
// });

// passport.deserializeUser(function (obj, done) {
//   done(null, obj);
// });

// // Initialize the Microsoft Graph client
// const credential = new DefaultAzureCredential();
// const graphClient = Client.initWithMiddleware({
//   authProvider: async (done) => {
//     const token = await credential.getToken(
//       "https://graph.microsoft.com/.default"
//     );
//     if (token) {
//       done(null, token.token);
//     } else {
//       done(new Error("Could not retrieve token"));
//     }
//   },
// });

// /**
//  * @swagger
//  * tags:
//  *   name: Outlook
//  *   description: Operations related to Outlook integration
//  */

// /**
//  * @swagger
//  * /auth/outlook:
//  *   get:
//  *     summary: Initiate Outlook OAuth2 authentication
//  *     description: Redirects the user to the Outlook OAuth2 consent screen for authentication.
//  *     responses:
//  *       302:
//  *         description: Redirect to Outlook OAuth2 consent screen.
//  *         headers:
//  *           Location:
//  *             description: URL for Outlook OAuth2 consent screen.
//  *             schema:
//  *               type: string
//  *   tags: [Outlook]
//  */

// outlookOauthRouter.get(
//   "/auth/outlook",
//   passport.authenticate("windowslive", {
//     scope: [
//       "openid",
//       "profile",
//       "offline_access",
//       "https://outlook.office.com/mail.read",
//     ],
//   })
// );

// /**
//  * @swagger
//  * /auth/outlook/callback:
//  *   get:
//  *     summary: Handle Outlook OAuth2 callback
//  *     description: Handles the callback from Outlook OAuth2 authentication and redirects the user to the specified endpoint.
//  *     responses:
//  *       302:
//  *         description: Redirect to specified endpoint.
//  *         headers:
//  *           Location:
//  *             description: URL for redirection.
//  *             schema:
//  *               type: string
//  *   tags: [Outlook]
//  */

// outlookOauthRouter.get(
//   "/auth/outlook/callback",
//   passport.authenticate("windowslive", { failureRedirect: "/login" }),
//   (req, res) => {
//     // Successful authentication.
//     res.redirect("/get-access-token")
//   }
// );

const clientId = process.env.OUTLOOK_CLIENT_ID
const tenantId = process.env.OUTLOOK_TENANT_ID
const redirectUri = process.env.OUTLOOK_CALLBACK_URL
const clientSecret = process.env.OUTLOOK_CLIENT_SECRET
const scopes = ["https://graph.microsoft.com/.default"];

const msalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri
  },
  cache:{
    cachelocation:"sessionStorage",
    storeAuthStateInCookie: false
  }
};

const ccaConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    clientSecret,
  },
};

const cca = new ConfidentialClientApplication(ccaConfig);

outlookOauthRouter.get("/get-access-token", async (req, res) => {
  try {
    const tokenRequest = {
      scopes,
      clientSecret,
    };

    const response = await cca.acquireTokenByClientCredential(tokenRequest);
    req.session.clientAccessToken = response.accessToken;
    res.send("Access token acquired successfully!");
  } catch (error) {
    console.error("Error acquiring client access token:", error.message);
    res.status(500).send("Error acquiring client access token.");
  }
});

const client = Client.init({
  authProvider: (done) => {
    done(null, accessToken);
  },
});

// outlookOauthRouter.get("/fetch-outlook-email", async (req, res) => {
//   try {
//     const userAccessToken = req.user.accessToken;
//     const clientAccessToken = req.session.clientAccessToken;

//     // Check if the user and client are authenticated
//     if (!userAccessToken) {
//       return res.status(401).send("User not authenticated. Please sign in first.");
//     }

//     if (!clientAccessToken) {
//       return res.status(401).send("Client not authenticated. Please acquire the client access token first.");
//     }

//     // Initialize the Microsoft Graph API client using the user access token
//     const client = Client.init({
//       authProvider: async (done) => {
//         // Check if the access token is expired
//         const tokenExpirationTime = req.user.exp * 1000; // Convert expiration time to milliseconds
//         const currentTime = new Date().getTime();

//         if (currentTime < tokenExpirationTime) {
//           // Access token is still valid, use it
//           done(null, userAccessToken);
//         } else {
//           // Access token has expired, use the refresh token to obtain a new access token
//           try {
//             const tokenRequest = {
//               scopes: ['https://graph.microsoft.com/.default'],
//               refreshToken: req.user.refreshToken,
//             };
//             const response = await cca.acquireTokenByRefreshToken(tokenRequest);
            
//             // Update the session with the new access token
//             req.user.accessToken = response.accessToken;
//             done(null, response.accessToken);
//           } catch (error) {
//             console.error("Error refreshing access token:", error.message);
//             done(new Error("Error refreshing access token"));
//           }
//         }
//       },
//     });

//     // Fetch the user's emails using the Microsoft Graph API
//     const messages = await client.api("/me/messages").top(1).get();
//     res.send(messages);
//   } catch (error) {
//     console.error("Error fetching emails from Outlook:", error);
//     res.status(500).send("An error occurred while fetching emails.");
//   }
// });

module.exports = { outlookOauthRouter };
