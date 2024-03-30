const express = require("express");
const session = require('express-session');
require('dotenv').config();
const { googleOauthRouter } = require("./routes/googleOauth");

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

app.use("/", googleOauthRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
