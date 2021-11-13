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
app.get("/getMatches/:region:/puuid:/matchType:/count", getMatches);
app.get("/getMatchesInfo/:region/:matches", getMatchInfos);

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});

const KEY = "RGAPI-2e3a145a-d0c3-4cf6-9b65-061be06ba020";
const KEY_QUERY = "?api_key=" + KEY;


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
async function getMatchess(req, res) {
  let region = req.params.region;
  let puuid = req.params.puuid;
  let matchType = req.params.matchType;
  let count = req.parasm.count;
  let xd = await getMatches(region, puuid, matchType, count);
  res.json(xd);
}

// const KEY = process.env.RIOT_API_KEY;

const MAPPED_REGIONS = {"americas": ["na1", "br1", "la1", "la2", "oc1"],
                        "asia": ["kr", "jp1"],
                        "europe": ["eun1", "euw1", "tr1", "ru"]};

/**
 * // https://developer.riotgames.com/apis#summoner-v4
 * @param {string} region ex: NA1, BR1, EWN1, EWN1, JP1, KR, LA1, LA2, OC1, RU, TR1
 * @param {string} name
 * @returns object with summoner name and puuid.
 */
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

/**
 *
 * @param {String} region
 * @returns general region
 */
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

/**
 *
 * @param {string} region
 * @param {string} name
 * @param {string} matchType
 * @returns the match data of last 10 ranked games, summoner name, and summoner puuid
 */
async function getMatches(region, puuid, matchType, count) {
    try {
        let queryString ='https://' + findGeneralRegion(region) + '.api.riotgames.com/lol/match/v5/matches/by-puuid/' + puuid + '/ids' + KEY_QUERY;
        queryString += "&count=" + count;
        queryString += "&type=" + matchType;
        let response = await axios.get(queryString, REQUEST_OPTIONS);
        console.log(respose);
        let data = await response.data;

        return data
    } catch(e) {
        console.warn(e);
        return "Error: Could not find matches for specified player";
    }
}

async function getMatchInfos(region, matches) {
    try {
        let matchInfos = [];
        for (const matchId of matches) {
            let response = await axios.get('https://' + findGeneralRegion(region) + '.api.riotgames.com/lol/match/v5/matches/' + matchId + KEY_QUERY);
            let matchInfo = await response.data;
            matchInfos.push(matchInfo);
        }

        return matchInfos;
    } catch(e) {
        console.warn(e);
        return "Error: Could not get match info for specified player";
    }
}
