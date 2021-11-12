"use strict";

const LATEST_DATA_DRAGON_VERSION = "11.22.1";

const KEY = "RGAPI-38a9c896-4504-415f-b917-2b3221ed5434";
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
    
        resultObj["killPercentage"] = getKillPercentage(gameStats.playerStats, gameStats.teamStats);
    
        resultObj["deathPercentage"] = getDeathPercentage(gameStats.playerStats, gameStats.teamPlayerStats, gameStats.teamStats);
    
        resultObj["damagePercentage"] = getDamagePercentage(gameStats.playerStats, gameStats.teamPlayerStats);
    
        resultObj["killParticipationPercentage"] = getKillParticipationPercentage(gameStats.playerStats, gameStats.teamStats);
    
        resultObj["minionsKilledPercentage"] = getMinionsKilledPercentage(gameStats.playerStats, gameStats.teamPlayerStats, gameStats.teamStats);
    
        resultObj["goldEarnedPercentage"] = getGoldEarnedPercentage(gameStats.playerStats, gameStats.teamPlayerStats, gameStats.teamStats);
    
        resultObj["visionScorePerMinute"] = getVisionScorePerMinute(gameStats.playerStats, gameStats.gameTimes);
    
        resultObj["visionScorePercentage"] = getVisionScorePercentage(gameStats.playerStats, gameStats.teamPlayerStats, gameStats.teamStats);
    
        resultObj["profileIconLink"] = getProfileIconLink(summoner.profileIcondId);
        console.log(gameStats.gameTimes);
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
        return {"name": name, "puuid": data.puuid, 
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

function getKillPercentage(playerStats, teamStats) {
    let killPercentages = [];
    for (let i = 0; i < 10; i++) {
      killPercentages.push((playerStats[i].kills / teamStats[i].objectives.champion.kills)* 100);
    }

    return median(killPercentages);
}

function median(arr) {
    const mid = Math.floor(arr.length / 2);
    const nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}

/**
 *
 * @param {string} region
 * @param {string} matchInfos
 * @returns an array of ally team's total damage dealt to champions ({10} games).
 * Each index represents one game. (From most recent ranked games)
 */
function getDamagePercentage(playerStats, teamPlayerStats) {
    let gameDamages = [];
    let index = 0;
    let playerTeamIds = [];
    let playerDmgDealt = [];
    for (const playerMatch of playerStats) {
        playerTeamIds.push(playerMatch.teamId);
        playerDmgDealt.push(playerMatch.totalDamageDealtToChampions);
    }

    for (const match of teamPlayerStats) {
        let summonerTeam = playerTeamIds[index];
        let tally = 0;
        for (const players of match) {
            if (players.teamId === summonerTeam) {
                tally += players.totalDamageDealtToChampions;
            }
        }
        gameDamages.push(playerDmgDealt[index] / tally * 100);
        index++;
    }
    return median(gameDamages);
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

    return median(visionScorePerMinute);
}

function getVisionScorePercentage(playerStats, teamPlayerStats, teamStats) {
    let playerVisionScores = [];
    for (const playerStat of playerStats) {
        playerVisionScores.push(playerStat.visionScore);
    }

    let teamVisionScores = [];
    for (let i = 0; i < teamPlayerStats.length; i++) {
        let teamVisionScore = 0;
        for (const singlePlayerStat of teamPlayerStats[i]) {
            if (singlePlayerStat.teamId === teamStats[i].teamId) {
                teamVisionScore += singlePlayerStat.visionScore;
            }
        }

        teamVisionScores.push(teamVisionScore);
    }

    let percentages = [];
    for (let i = 0; i < playerVisionScores.length; i++) {
        if (teamVisionScores[i] !== 0) {
            percentages.push(playerVisionScores[i] / teamVisionScores[i] * 100);
        }
    }

    return median(percentages);
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

    return median(percentages)
}


function getMinionsKilledPercentage(playerStats, teamPlayerStats, teamStats) {
    let playerCSs = [];
    for (const playerStat of playerStats) {
        playerCSs.push(playerStat.neutralMinionsKilled + playerStat.totalMinionsKilled);
    }

    let teamCSs = [];
    for (let i = 0; i < teamPlayerStats.length; i++) {
        let teamCS = 0;
        for (const singlePlayerStat of teamPlayerStats[i]) {
            if (singlePlayerStat.teamId === teamStats[i].teamId) {
                teamCS += singlePlayerStat.neutralMinionsKilled + singlePlayerStat.totalMinionsKilled;
            }
        }

        teamCSs.push(teamCS);
    }

    let percentages = [];
    for (let i = 0; i < playerCSs.length; i++) {
        if (teamCSs[i] !== 0) {
            percentages.push(playerCSs[i] / teamCSs[i] * 100);
        }
    }

    return median(percentages);
}


function getGoldEarnedPercentage(playerStats, teamPlayerStats, teamStats) {
    let playerGolds = [];
    for (const playerStat of playerStats) {
        playerGolds.push(playerStat.goldEarned);
    }

    let teamGolds = [];
    for (let i = 0; i < teamPlayerStats.length; i++) {
        let teamGold = 0;
        for (const singlePlayerStat of teamPlayerStats[i]) {
            if (singlePlayerStat.teamId === teamStats[i].teamId) {
                teamGold += singlePlayerStat.goldEarned;
            }
        }

        teamGolds.push(teamGold);
    }

    let percentages = [];
    for (let i = 0; i < playerGolds.length; i++) {
        if (teamGolds[i] !== 0) {
            percentages.push(playerGolds[i] / teamGolds[i] * 100);
        }
    }

    return median(percentages);
}

function getDeathPercentage(playerStats, teamPlayerStats, teamStats) {
    let playerDeaths = [];
    for (const playerStat of playerStats) {
        playerDeaths.push(playerStat.deaths);
    }

    let teamDeaths = [];
    for (let i = 0; i < teamPlayerStats.length; i++) {
        let teamDeath = 0;
        for (const singlePlayerStat of teamPlayerStats[i]) {
            if (singlePlayerStat.teamId === teamStats[i].teamId) {
                teamDeath += singlePlayerStat.deaths;
            }
        }

        teamDeaths.push(teamDeath);
    }

    let percentages = [];
    for (let i = 0; i < playerDeaths.length; i++) {
        if (teamDeaths[i] !== 0) {
            percentages.push(playerDeaths[i] / teamDeaths[i] * 100);
        }
    }

    return median(percentages);
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