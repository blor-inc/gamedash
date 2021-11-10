// example api calls in another file:
"use strict";

const latestDataDragonVersion = "11.22.1";
const KEY = "RGAPI-acf780b1-c260-40fb-b56a-6a4454669348";
const KEY_QUERY = "?api_key=" + KEY;

const MAPPED_REGIONS = {"americas": ["na1", "br1", "la1", "la2", "oc1"],
                        "asia": ["kr", "jp1"],
                        "europe": ["eun1", "euw1", "tr1", "ru"]};

/**
 * Example API (check if it works)
 * gets champion rotations
 *
 * https://developer.riotgames.com/apis#champion-v3
 * @param {String} region ex: NA1, BR1, EWN1, EWN1, JP1, KR, LA1, LA2, OC1, RU, TR1
 * @returns maxNewPlayerLevel, freeChampionIdsForNewPlayers, freeChampionIds
 */
export function champRotation(region) {
    return fetch('https://' + region + '.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=' + KEY_QUERY)
        .then(resp => resp.json())
        .catch((error) => console.warn("ERROR: ", error));
}

/**
 * // https://developer.riotgames.com/apis#summoner-v4
 * @param {string} region 
 * @param {string} name 
 * @returns object with summoner name and puuid.
 */
async function summonerByName(region, name) {
    try {
    let response = await fetch('https://' + region + '.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + name + KEY_QUERY);
    await statusCheck(response);
    let data = await response.json();
    return {"name": name, "puuid": data.puuid};
    // return data;
    } catch(e) {
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
 * @returns the match data of last 10 games, summoner name, and summoner puuid
 */
async function getMatches(region, name) {
    try {
        let summonerName = await summonerByName(region, name);

        let puuid = summonerName.puuid;
        // number of games ; range: 1-100
        let count = 10;
        let type = "ranked";
        let queryString ='https://' + findGeneralRegion(region) + '.api.riotgames.com/lol/match/v5/matches/by-puuid/' + puuid + '/ids' + KEY_QUERY;
        queryString += "&count=" + count;
        queryString += "&type=" + type;

        let response = await fetch(queryString);
        await statusCheck(response);
        let data = await response.json();

        let returnData = summonerName;
        returnData["matches"] = data;
        return returnData;
    } catch(e) {
        console.log(e);
        return "Error: Could not find matches for specified player";
    }
}
/**
 * 
 * @param {string} region 
 * @param {string} name 
 * @returns player stats, general team stats, team player stats, and match ids of the last {10} games. (see getMatchs()) 
 * also returns with summoner name and puuid
 */
export async function getMatchesInfo(region, name) {
    try {
        let arr = [];
        let team = [];
        let teamPlayerStats = [];
        let json = await getMatches(region, name);
        for (const matchId of json.matches) {
            let response = await fetch('https://' + findGeneralRegion(region) + '.api.riotgames.com/lol/match/v5/matches/' + matchId + KEY_QUERY);
            await statusCheck(response);
            let data = await response.json();
            teamPlayerStats.push(data.info.participants);
            for (const participant of data.info.participants) {
                if (participant.puuid === json.puuid) {
                    arr.push(participant);
                    team.push(data.info.teams[(participant.teamId / 100) - 1]);
                    break;
                }
            }
        }
        json["teamPlayerStats"] = teamPlayerStats;
        json["playerStats"] = arr;
        json["teamStats"] = team;
        return json;
    } catch(e) {
        return "Error: Could not get match info for specified player";
    }
}

/**
 * 
 * @param {string} region 
 * @param {string} name 
 * @returns an array of ally team's total damage dealt to champions ({10} games).
 * Each index represents one game. (From most recent ranked games)
 */
export async function getMatchesTeamDamage(region, name) {
    let playerMatchData = await getMatchesInfo(region, name);
    console.log(playerMatchData);
    let gameDmg = [];
    let index = 0;
    let playerTeamIds = []
    for (const playerMatch of playerMatchData.playerStats) {
        playerTeamIds.push(playerMatch.teamId);
    }

    for (const match of playerMatchData.teamPlayerStats) {
        let summonerTeam = playerTeamIds[index];
        let tally = 0;
        for (const players of match) {
            if (players.teamId === summonerTeam) {
                tally += players.totalDamageDealtToChampions;
            }
        }
        gameDmg.push(tally);
        index++;
    }

    return gameDmg;

}

/**
 * 
 * @param {string} id 
 * @returns The link for league profile icon
 */
export function getProfileIconLink(id) {
    return 'https://ddragon.leagueoflegends.com/cdn/' + latestDataDragonVersion + '/img/profileicon/' + id + '.png'
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