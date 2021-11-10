// example api calls in another file:
"use strict";

const latestDataDragonVersion = "11.22.1";
const KEY = "RGAPI-acf780b1-c260-40fb-b56a-6a4454669348";
const KEY_QUERY = "?api_key=" + KEY;

const MAPPED_REGIONS = {"americas": ["na1", "br1", "la1", "la2", "oc1"],
                        "asia": ["kr", "jp1"],
                        "europe": ["eun1", "euw1", "tr1", "ru"]};


// export function getPuuid(name) {
//     fetch()
//     .then(statusCheck)
//     .then(resp => resp.json())
//     .then(processPuuid)
//     }
// }

// function processPuuid(data) {

// }

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

// https://developer.riotgames.com/apis#summoner-v4
// regions include: NA1, BR1, EWN1, EWN1, JP1, KR, LA1, LA2, OC1, RU, TR1
// return with: accountId, profileIconId, revisionDate, name, id, puuid, summonerLevel
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


export async function getMatches(region, name) {
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

export async function getMatchesInfo(region, name) {
    try {
        let arr = [];
        let team = [];

        let json = await getMatches(region, name);
        console.log(json);

        for (const matchId of json.matches) {
            console.log(matchId);
            let response = await fetch('https://' + findGeneralRegion(region) + '.api.riotgames.com/lol/match/v5/matches/' + matchId + KEY_QUERY);
            await statusCheck(response);
            let data = await response.json();
            console.log(data);
            for (const participant of data.info.participants) {
                if (participant.puuid === json.puuid) {
                    arr.push(participant);
                    team.push(data.info.teams[(participant.teamId / 100) - 1]);
                    break;
                }
            }
        }
        json["playerStats"] = arr;
        json["teamStats"] = team;
        // console.log(json);
        return json;
        // let matchId = await getMatches(region, name);
        // let response = await fetch('https://' + findGeneralRegion(region) + '.api.riotgames.com/lol/match/v5/matches/' + matchId + KEY_QUERY);
        // await statusCheck(response);
        // let data = await response.json();
        // return data;
    } catch(e) {
        return "Error: Could not get match info for specified player";
    }
}


/**
 *
 * // https://developer.riotgames.com/apis#match-v5
 * @param {string} region americas (NA, BR, LAN, LAS, and OCE), asia (KR and JP), europe (EUNE, EUW, TR, and RU)
 * @param {string} puuid
 * @param {string} count
 * @param {string} start
 * @param {string} type
 * @param {string} startTime
 * @param {string} endTime
 * @param {string} queue
 * @returns array of match ids
 */
export function matches(region, puuid, count, start, type, startTime, endTime, queue) {
    let queryString ='https://' + region + '.api.riotgames.com/lol/match/v5/matches/by-puuid/' + puuid + '/ids' + KEY_QUERY;

    if  (count) {queryString += '&count=' + count}else{queryString += '&count=100'};
    if  (start) queryString += '&start=' + start;
    if  (type) queryString += '&type=' + type;
    if  (startTime) queryString += '&startTime=' + startTime;
    if  (endTime) queryString += '&endTime=' + endTime;
    if  (queue) queryString += '&queue=' + queue;

    return fetch(queryString)
        .then(resp => resp.json())
        .catch((error) => console.warn("ERROR: ", error));
}

// regions include: americas (NA, BR, LAN, LAS, and OCE), asia (KR and JP), europe (EUNE, EUW, TR, and RU)
// gets all match ids of a player
export function getallSummonerGames(region, puuid) {
    let allMatchIds = [];
    let c = 100;
    let index = 0;
    let helper = function() {
        matches(region, puuid, c, index).then(function(data) {
            if (data.length !== 0) {
                for (let i = 0; i < data.length; i++) {
                    allMatchIds.push(data[i]);
                }
                index += data.length;
                helper()
            }
        });
    }
    helper();
    return allMatchIds;
}

// regions include: americas (NA, BR, LAN, LAS, and OCE), asia (KR and JP), europe (EUNE, EUW, TR, and RU)
// returns match data
export function getMatchDetails(region, matchid) {
    return fetch('https://' + region + '.api.riotgames.com/lol/match/v5/matches/' + matchid + KEY_QUERY)
        .then(resp => resp.json())
        .catch((error) => console.warn("ERROR: ", error));
}

export function getProfileIconLink(id) {
    return 'https://ddragon.leagueoflegends.com/cdn/' + latestDataDragonVersion + '/img/profileicon/' + id + '.png'
}

async function statusCheck(response) {
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response;
}