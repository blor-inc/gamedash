// example api calls in another file:

let latestDataDragonVersion = "11.22.1";
let key = process.env.VUE_APP_RIOT_API_KEY;

// https://developer.riotgames.com/apis#champion-v3
// regions include: NA1, BR1, EWN1, EWN1, JP1, KR, LA1, LA2, OC1, RU, TR1
// retruns with: maxNewPlayerLevel, freeChampionIdsForNewPlayers, freeChampionIds
let champRotation = function (region) {
    return fetch('https://' + region + '.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=' + key)
        .then(resp => resp.json())
        .catch((error) => console.warn("ERROR: ", error));
}

// https://developer.riotgames.com/apis#summoner-v4
// regions include: NA1, BR1, EWN1, EWN1, JP1, KR, LA1, LA2, OC1, RU, TR1
// return with: accountId, profileIconId, revisionDate, name, id, puuid, summonerLevel
let summonerByName = function (region, name) {
    return fetch('https://' + region + '.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + name + '?api_key=' + key)
        .then(resp => resp.json())
        .catch((error) => console.warn("ERROR: ", error));
}

// https://developer.riotgames.com/apis#match-v5
// regions include: americas (NA, BR, LAN, LAS, and OCE), asia (KR and JP), europe (EUNE, EUW, TR, and RU)
// returns an array of match ids
// puuid and region are required
let matches = function (region, puuid, count, start, type, startTime, endTime, queue) {
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
let getallSummonerGames = function(region, puuid) {
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
let getMatchDetails = function(region, matchid) {
    return fetch('https://' + region + '.api.riotgames.com/lol/match/v5/matches/' + matchid + '?api_key=' + key)
        .then(resp => resp.json())
        .catch((error) => console.warn("ERROR: ", error));
}

let getProfileIconLink = function(id) {
    return 'https://ddragon.leagueoflegends.com/cdn/' + latestDataDragonVersion + '/img/profileicon/' + id + '.png'
}
export {champRotation, summonerByName, matches, getallSummonerGames, getMatchDetails, getProfileIconLink};