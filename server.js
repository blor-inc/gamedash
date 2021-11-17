const express = require("express");
const path = require("path");
const axios = require('axios');

const app = express();
const port = process.env.PORT || "8000";

app.use(express.static('public'));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get("/sumByName/:region/:name", getSummoner);
app.get("/getMatches/:region/:puuid/:matchType/:count", getMatchesAPI);
app.get("/getMatchesInfo/:region/:match", matchInfoAPI);

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});

const KEY = process.env.RIOT_API_KEY;
// const KEY = "RGAPI-845ae22f-1174-412f-9a3d-7413515d9f10";
const KEY_QUERY = "?api_key=" + KEY;
app.get("/key", key);
function key(req, res) {
    res.json(KEY);
}

// This prevents something called preflight requests which can cause CORS errors.
// GET requests encourages simple requests and tries to avoid CORS policy blocked errors.
const REQUEST_OPTIONS = {
  method: 'GET',
}

async function getSummoner(req, res) {
  let name = req.params.name;
  let region = req.params.region;
  let xd = await getSummonerByName(region, name);
  res.json(xd);
}
async function getMatchesAPI(req, res) {
  let region = req.params.region;
  let puuid = req.params.puuid;
  let matchType = req.params.matchType;
  let count = req.params.count;
  let xd = await getMatches(region, puuid, matchType, count);
  res.json(xd);
}

async function matchInfoAPI(req, res) {
    let region = req.params.region;
    let match = req.params.match;
    let xd = await getMatchInfo(region, match);
    res.json(xd);
}


const MAPPED_REGIONS = {"americas": ["na1", "br1", "la1", "la2", "oc1"],
                        "asia": ["kr", "jp1"],
                        "europe": ["eun1", "euw1", "tr1", "ru"]};

async function getSummonerByName(region, name) {
    try {
        let response = await axios.get('https://' + region + '.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + name + KEY_QUERY, REQUEST_OPTIONS);
        let data = await response.data;
        // Some doggy put {"name": name}
        return {"name": data.name, "puuid": data.puuid,
            "profileIcondId": data.profileIconId, "summonerLevel": data.summonerLevel};
    } catch(e) {
        console.warn(e);
        return "Error: Could not find player name";
    }
}

function findGeneralRegion(region) {
    let generalRegion;
    if (MAPPED_REGIONS.americas.includes(region)) {
        generalRegion = "americas";
    } else if (MAPPED_REGIONS.asia.includes(region)) {
        generalRegion = "asia";
    } else {
        generalRegion = "europe";
    }
    return generalRegion;
}

async function getMatches(region, puuid, matchType, count) {
    try {
        let queryString ='https://' + findGeneralRegion(region) + '.api.riotgames.com/lol/match/v5/matches/by-puuid/' + puuid + '/ids' + KEY_QUERY;
        queryString += "&count=" + count;
        queryString += "&type=" + matchType;
        let response = await axios.get(queryString, REQUEST_OPTIONS);
        let data = await response.data;
        return data
    } catch(e) {
        console.warn(e);
        return "Error: Could not find matches for specified player";
    }
}

async function getMatchInfo(region, match) {
    try {
        let queryString = 'https://' + findGeneralRegion(region) + '.api.riotgames.com/lol/match/v5/matches/' + match + KEY_QUERY;
        let response = await axios.get(queryString, REQUEST_OPTIONS);
        let data = await response.data;
        return data;
    } catch(e) {
        console.warn(e);
        return "Error: Could not get match info for specified player";
    }
}
