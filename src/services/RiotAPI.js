// example api calls in another file:

const latestDataDragonVersion = "11.22.1";
const key = "RGAPI-e4cad59c-5144-4c47-9dee-a86dba84d8b9";

/**
 * Example API (check if it works)
 * gets champion rotations
 *
 * https://developer.riotgames.com/apis#champion-v3
 * @param {String} region ex: NA1, BR1, EWN1, EWN1, JP1, KR, LA1, LA2, OC1, RU, TR1
 * @returns maxNewPlayerLevel, freeChampionIdsForNewPlayers, freeChampionIds
 */
export function champRotation(region) {
    return fetch('https://' + region + '.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=' + key)
        .then(resp => resp.json())
        .catch((error) => console.warn("ERROR: ", error));
}

// https://developer.riotgames.com/apis#summoner-v4
// regions include: NA1, BR1, EWN1, EWN1, JP1, KR, LA1, LA2, OC1, RU, TR1
// return with: accountId, profileIconId, revisionDate, name, id, puuid, summonerLevel
export function summonerByName(region, name) {
    return fetch('https://' + region + '.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + name + '?api_key=' + key)
        .then(resp => resp.json())
        .catch((error) => console.warn("ERROR: ", error));
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
    let queryString ='https://' + region + '.api.riotgames.com/lol/match/v5/matches/by-puuid/' + puuid + '/ids' + '?api_key=' + key;

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
    return fetch('https://' + region + '.api.riotgames.com/lol/match/v5/matches/' + matchid + '?api_key=' + key)
        .then(resp => resp.json())
        .catch((error) => console.warn("ERROR: ", error));
}

export function getProfileIconLink(id) {
    return 'https://ddragon.leagueoflegends.com/cdn/' + latestDataDragonVersion + '/img/profileicon/' + id + '.png'
}