const express = require("express");
const path = require("path");
const axios = require('axios');

const app = express();
const port = process.env.PORT || "8000";

app.use(express.static('public'));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});


app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});