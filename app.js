const express = require("express");
const path = require("path");
const axios = require('axios');

const app = express();
const port = process.env.PORT || "8000";

app.use(express.static('public'));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get("/liquid", (req, res) => {
  console.log("ward")
  hehe();
});

const KEY = "uiz61IE61z4ggaxxoUrbTQYtoNrxgxpBBtcynud5gPdUVjSjTCkWvh68huok0iI2In1PgPA51Aer9ItLYsZBOzg7uKBNyZeRHKNZnaAzUIyBYFRSqmKjEY0JzX8YXu7S";


async function hehe() {
    let data = await axios.get("https://api.liquipedia.net/api/v2/settings?wiki=leagueoflegends", {
        method: 'GET',
        // mode: 'no-cors',
        headers: {
            "authorization": "Apikey " + KEY,
            "accept":"application/json",
        }
    });
    console.log(data);
}


app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});