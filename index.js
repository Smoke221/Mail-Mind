const express = require("express");
const session = require('express-session');
const passport = require('passport');
const swaggerUi = require("swagger-ui-express")
require('dotenv').config();
const { googleOauthRouter } = require("./routes/googleOauth");
const { outlookOauthRouter } = require("./routes/outlookOauth");
const swaggerSpec = require("./swagger")
// const pushNotificationController = require("./controllers/notification");

const app = express();

// Middleware setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

app.set("trust proxy", true);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Routes
app.get("/", (req, res) => {
  res.send(`
          <h1>Welcome to the Mail Mind.</h1>
          <p>Your AI assistant for managing mails.</p>
    `);
});
app.use("/", googleOauthRouter);
app.use("/", outlookOauthRouter);

// // Set up push notification channel and subscribe to Pub/Sub topic on server start
// pushNotificationController.createPushNotificationChannel();
// pushNotificationController.subscribeToPubSubTopic();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
