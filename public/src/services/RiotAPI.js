"use strict";
const LATEST_DATA_DRAGON_VERSION = "11.22.1";
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
        // console.log(summoner);
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

async function getSummonerByName(region, name) {
    try {
        let response = await fetch("/sumByName/" + region + "/" + name);
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
 * @param {string} region
 * @param {string} name
 * @param {string} matchType
 * @returns the match data of last 10 ranked games, summoner name, and summoner puuid
 */
async function getMatches(region, puuid, matchType, count) {
    try {
        let response = await fetch("/getMatches/" + region + "/" + puuid + "/" + matchType +"/" + count);
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
            let response = await fetch("/getMatchesInfo/" + region + "/" + matchId);
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

// If we aren't using this can we comment it out
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

// if we aren't using this can we comment it out
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