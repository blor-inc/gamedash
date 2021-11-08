  // api testing -----------------------------------------------------------------------------------------------
  import {champRotation, summonerByName, matches, getallSummonerGames, getMatchDetails, getProfileIconLink} from '/RiotAPI.js';

  champRotation('na1').then(function(data) {
    console.log(data.freeChampionIds);
  });
  summonerByName('na1', 'Seagreen526').then(function(data) {
    console.log(data);
  });
  matches('americas', 'p-_h_rl0fJru_VaqeKCMYEDu98FIaOr0r-HLZQzQXm0C5pqAaH4l_iE_w1XzB1ZHLNy_3ryHMu4aHQ').then(function(data) {
    console.log(data);
  });
  console.log(getallSummonerGames("americas", 'FelliDLGt30fA25eIDAIqgqe1qTysMVAmD4vvVhbztHoxIakFlLMpWxZxny7G_ZeN5mtab6ACdWFzw'));
  getMatchDetails('americas', 'NA1_4089743970').then(function(data) {
    console.log(data);
  });
  console.log(getProfileIconLink('5031'));
  // ---------------------------------------------------------------------------------------------------------------------