"use strict";

const LATEST_DATA_DRAGON_VERSION = "11.22.1";

// const KEY = process.env.RIOT_API_KEY;
const KEY = "RGAPI-33247fee-1b0c-4b77-9a53-e32d67cee439";
const KEY_QUERY = "?api_key=" + KEY;

const MAPPED_REGIONS = {"americas": ["na1", "br1", "la1", "la2", "oc1"],
                        "asia": ["kr", "jp1"],
                        "europe": ["eun1", "euw1", "tr1", "ru"]};

// This prevents something called preflight requests which can cause CORS errors.
// GET requests encourages simple requests and tries to avoid CORS policy blocked errors.
const REQUEST_OPTIONS = {
    method: 'GET',
}

/**
 * One function to rule them all.
 *
 * A single function that calls all necessary helpers to aggregate and return
 * a single object with everything needed by the app.
 *
 * This also prevents multiple helpers from each calling the same API multiple times.
 * @param {String} region
 * @param {String} summonerName
 */
export async function getUserData(region, summonerName) {
    try {
        let resultObj = [];

        let summoner = await getSummonerByName(region, summonerName);

        let matches = await getMatches(region, summoner.puuid, "ranked", 10);

        resultObj["gamesFound"] = matches.length;
        if (resultObj["gamesFound"] < 1) {
            return resultObj;
        }

        let matchInfos = await getMatchInfos(region, matches);

        resultObj["summoner"] = summoner;

        const gameStats = await getGameStats(summoner.puuid, matchInfos);
        resultObj["gameStats"] = gameStats;

        resultObj["killPercentage"] = getPlayerTraitsPercentage(gameStats, ["kills"]);

        resultObj["deathPercentage"] = getPlayerTraitsPercentage(gameStats, ["deaths"]);

        resultObj["damagePercentage"] = getPlayerTraitsPercentage(gameStats, ["totalDamageDealtToChampions"]);

        resultObj["killParticipationPercentage"] = getKillParticipationPercentage(gameStats.playerStats, gameStats.teamStats);

        resultObj["minionsKilledPercentage"] = getPlayerTraitsPercentage(gameStats, ["neutralMinionsKilled", "totalMinionsKilled"]);

        resultObj["goldEarnedPercentage"] = getPlayerTraitsPercentage(gameStats, ["goldEarned"]);

        resultObj["visionScorePerMinute"] = getVisionScorePerMinute(gameStats.playerStats, gameStats.gameTimes);

        resultObj["visionScorePercentage"] = getPlayerTraitsPercentage(gameStats, ["visionScore"]);

        resultObj["visionWardsPlacedPercentage"] = getPlayerTraitsPercentage(gameStats, ["wardsPlaced"])

        let timeSpentDead = average(getPlayerTraitsTotal(gameStats, ["totalTimeSpentDead"]));
        let totalGameTime = average(gameStats.gameTimes);

        resultObj["timeSpentDeadPercentage"] = 100 * timeSpentDead / totalGameTime;

        resultObj["profileIconLink"] = getProfileIconLink(summoner.profileIcondId);

        return resultObj;
    } catch (e) {
        console.warn(e);
        return "error";
    }

}

async function getGameStats(puuid, matchInfos) {
    let resultObj = [];

    let gameTimes = [];
    let teamPlayerStats = [];
    let playerStats = [];
    let teamStats = [];
    for (const matchInfo of matchInfos) {
        let playerGameTimes = [];

        teamPlayerStats.push(matchInfo.info.participants);
        for (const participant of matchInfo.info.participants) {
            playerGameTimes.push(participant.timePlayed);

            if (participant.puuid === puuid) {
                playerStats.push(participant);
                teamStats.push(matchInfo.info.teams[(participant.teamId / 100) - 1]);
                break;
            }
        }

        gameTimes.push(Math.max.apply(Math, playerGameTimes));
    }

    resultObj["gameTimes"] = gameTimes;
    resultObj["teamPlayerStats"] = teamPlayerStats;
    resultObj["playerStats"] = playerStats;
    resultObj["teamStats"] = teamStats;

    return resultObj
}

/**
 * Example API (check if it works)
 * gets champion rotations
 *
 * https://developer.riotgames.com/apis#champion-v3
 * @param {String} region ex: NA1, BR1, EWN1, EWN1, JP1, KR, LA1, LA2, OC1, RU, TR1
 * @returns maxNewPlayerLevel, freeChampionIdsForNewPlayers, freeChampionIds
 */
async function getChampRotation(region) {
    return fetch('https://' + region + '.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=' + KEY_QUERY, REQUEST_OPTIONS)
        .then(resp => resp.json())
        .catch((error) => console.warn("ERROR: ", error));
}

/**
 * // https://developer.riotgames.com/apis#summoner-v4
 * @param {string} region ex: NA1, BR1, EWN1, EWN1, JP1, KR, LA1, LA2, OC1, RU, TR1
 * @param {string} name
 * @returns object with summoner name and puuid.
 */
async function getSummonerByName(region, name) {
    try {
        let response = await fetch('https://' + region + '.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + name + KEY_QUERY, REQUEST_OPTIONS);
        await statusCheck(response);
        let data = await response.json();
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
        let response = await fetch(queryString, REQUEST_OPTIONS);
        await statusCheck(response);
        let data = await response.json();

        return data
    } catch(e) {
        console.warn(e);
        return "Error: Could not find matches for specified player";
    }
}

/**
 *
 * @param {string} region
 * @param {string[]} matches
 * @returns array of matchInfo
 */
async function getMatchInfos(region, matches) {
    try {
        let matchInfos = [];
        for (const matchId of matches) {
            let response = await fetch('https://' + findGeneralRegion(region) + '.api.riotgames.com/lol/match/v5/matches/' + matchId + KEY_QUERY);
            await statusCheck(response);
            let matchInfo = await response.json();
            matchInfos.push(matchInfo);
        }

        return matchInfos;
    } catch(e) {
        console.warn(e);
        return "Error: Could not get match info for specified player";
    }
}

function median(arr) {
    const mid = Math.floor(arr.length / 2);
    const nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}

function average(arr) {
    let total = 0;
    for (let i = 0; i < arr.length; i++) {
        total += arr[i];
    }

    return total / arr.length;
}

/**
 *
 * @param {string} region
 * @param {string} name
 * @returns array of vision score per minute 0 index is the most recent ranked game
 */
function getVisionScorePerMinute(playerStats, gameTimes) {
    let visionScorePerMinute = [];
    let visionScores = []
    let index = 0;
    for (const playerStat of playerStats) {
        visionScores.push(playerStat.visionScore);
    }

    for (const gameTime of gameTimes) {
        if (gameTime !== 0) {
            visionScorePerMinute.push(visionScores[index] / gameTime * 60);
        }
        index += 1;
    }

    return average(visionScorePerMinute);
}

function getKillParticipationPercentage(playerStats, teamStats) {
    let playerKPs = [];
    for (const playerStat of playerStats) {
        playerKPs.push(playerStat.assists + playerStat.kills);
    }

    let teamKPs = [];
    for (const teamStat of teamStats) {
        teamKPs.push(teamStat.objectives.champion.kills);
    }

    let percentages = [];
    for (let i = 0; i < playerKPs.length; i++) {
        if (teamKPs[i] !== 0) {
            percentages.push(playerKPs[i] / teamKPs[i] * 100);
        }
    }

    return average(percentages)
}

function getTimeSpentDeadPercentageOfGame(gameStats) {
    let playerDeathTimes = [];
    for (const playerStat of gameStats.playerStats) {
        playerDeathTimes.push(playerStat.totalTimeSpentDead);
    }

    let percentages = [];
    for (let i = 0; i < playerDeathTimes.length; i++) {
        if (gameStats.gameTimes[i] !== 0) {
            percentages.push(playerDeathTimes[i]);
        }
    }

    return average(percentages)
}

function getPlayerTraitsTotal(gameStats, traits) {
    let playerXs = [];
    for (const playerStat of gameStats.playerStats) {
        let playerX = 0;
        for (const trait of traits) {
            playerX += playerStat[trait];
        }
        playerXs.push(playerX);
    }

    return playerXs;
}

function getTeamTraitsTotal(gameStats, traits) {
    let teamXs = [];
    for (let i = 0; i < gameStats.teamPlayerStats.length; i++) {
        let teamX = 0;
        for (const singlePlayerStat of gameStats.teamPlayerStats[i]) {
            if (singlePlayerStat.teamId === gameStats.teamStats[i].teamId) {
                for (const trait of traits) {
                    teamX += singlePlayerStat[trait];
                }
            }
        }

        teamXs.push(teamX);
    }

    return teamXs;
}

function getPlayerPercentageOfTeam(playerValues, teamValues) {
    let percentages = [];
    for (let i = 0; i < playerValues.length; i++) {
        if (teamValues[i] !== 0) {
            percentages.push(playerValues[i] / teamValues[i] * 100);
        }
    }

    return average(percentages);
}

// generalized function for calculating percentage of team across specific "playerTraits"
function getPlayerTraitsPercentage(gameStats, traits) {
    const playerValues = getPlayerTraitsTotal(gameStats, traits);

    const teamValues = getTeamTraitsTotal(gameStats, traits);

    return getPlayerPercentageOfTeam(playerValues, teamValues);
}

/**
 *
 * @param {string} region
 * @param {string} name
 * @returns object with profileIconLink and summonerLevel
 */
function getProfileIconLink(profileIcondId) {
    return 'https://ddragon.leagueoflegends.com/cdn/' + LATEST_DATA_DRAGON_VERSION + '/img/profileicon/' + profileIcondId + '.png';
}

/**
 *
 * @param {string} response
 * @returns response
 */
async function statusCheck(response) {
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response;
}
