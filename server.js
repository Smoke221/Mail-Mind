const express = require("express");
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
const { googleOauthRouter } = require("./routes/googleOauth");
const { outlookOauthRouter } = require("./routes/outlookOauth");

const app = express();

app.get("/", (req, res) => {
  res.send(`
          <h1>Welcome to the Mail Mind.</h1>
          <p>Your AI assistant for managing mails.</p>
    `);
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/", googleOauthRouter)
app.use("/", outlookOauthRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
