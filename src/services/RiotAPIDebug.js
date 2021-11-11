// api testing -----------------------------------------------------------------------------------------------
import * as apiService from "./RiotAPI.js";
// console.log(apiService.getallSummonerGames("americas", 'FelliDLGt30fA25eIDAIqgqe1qTysMVAmD4vvVhbztHoxIakFlLMpWxZxny7G_ZeN5mtab6ACdWFzw'));
// console.log(await apiService.getMatchesInfo("na1", "nubwett"));
// console.log(await apiService.summonerByName("na1", "nubwett"));

// console.log(await apiService.getVisionScorePerMinute("na1", "nubwett"));
// console.log(await apiService.getMatchesInfo("na1", "nubwett"));
// console.log(await apiService.summonerByName("na1", "nubwett"));
console.log(await apiService.getProfileInfo("na1", "nubwett"));

// ---------------------------------------------------------------------------------------------------------------------