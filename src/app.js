"use strict";

// Data collection from API
import * as RiotAPI from "./services/RiotAPI.js";


/// Graph functions
(function() {
  window.addEventListener("load", init);
  let searchInput = "";
  let labels = [];
  var colors = ['rgb(255, 214, 132, 1)', 'rgb(94, 72, 200,1)', 'rgb(255, 214, 132, 1)',
                'rgba(74, 99, 231,1)', 'rgb(255, 214, 132, 1)', 'rgba(117, 50, 133,1)',
                'rgb(255, 214, 132, 1)', 'rgba(17, 157, 164, 1)']

  function test() {
    // API test
    // RiotAPI.getUserData("na1", "nubwett").then(console.log);

    // graph test
    // let box10 = newStat(10);
    // createGraph([25, 75], ["A", "B"], "Test Test Test", box10, colors.slice(0,2));
    // createGraph([25, 75], ["A", "B"], "Test Again", box10, colors.slice(0,2));

    // const score1 = getKSScore(25, 25);
    // break_line();

    // let box11 = newStat(11);
    // createGraph([25, 75], ["A", "B"], "Another Test", box11, colors.slice(0,2));
    // break_line();
    // createCard(score1, "Test Stat", "alskjdflasjflkasjdflajsdlfjalsdfjalsdfjalsdkjf", box11);


    // score test
    // for (let v = -10; v < 15; v += 0.1) {
    //   console.log(v + ' ' + getKSScore(10 + v, 10));
    // }

    // farmer test
    // for (let kp = 35; kp < 75; kp++) {
    //   for (let m = 10; m < 50; m++) {
    //     console.log('kp:' + kp + ', m:' + m + ', score:' + getAFKFarmingScore(kp, m));
    //   }
    // }

    // gray screen gamer test
    // for (let d = 0; d < 50; d++) {
    //   for (let t = 0; t < 25; t++) {
    //     console.log('d:' + d + ', t:' + t + ', score:' + getGrayScreenScore(d, t));
    //   }
    // }

    // vision test
    // for (let v = 20; v < 90; v += 1) {
    //   console.log(v + ' ' + getVisionaryScore(v - 10, 10));
    // }
  }



  function init() {
    // uncomment for tests
    // test();

    let search_text = id("fname");

    // allows the use of the enter key
    search_text.addEventListener('keypress', function(event) {
      if (event.key === "Enter"){
        event.preventDefault();
        summonerIdSearch();
      }
    })

    let items = document.getElementsByName('item');
    let selectedItem = id('selected-item');
    let dropdown = id('dropdown');

    // adds the drop-down option for the different regions. Ex: NA1, BR1.
    items.forEach(item => {
      item.addEventListener('change', () => {
        if (item.checked) {
          selectedItem.innerHTML = item.value;
          dropdown.open = false;
        }
      });
    });
  }

  /**
   * create an item that is contained in the specified row.
   * @param {int} num representing row number
   * @returns a container that fits in the specified row
   */
  function newStat(num){
    let new_row = "row" + num;
    let box = gen("div");
    box.id = new_row;
    box.classList.add("box");
    id("graphs").append(box);
    return new_row;
  }

  /**
   * adds a line break in text.
   * @returns a divider that acts as a line break
   */
  function break_line(){
    let row_break = gen("div");
    row_break.id = "row_break";
    row_break.classList.add("break");
    id("graphs").append(row_break);
    return row_break;
  }

  /**
   * creates the card for the specified section relating to the graphs generated.
   * @param {*} score The score, 1-10, of the player's performance in the specified section.
   * @param {*} name The name of the specified section, ex: Kill Security, AFK Farming, etc.
   * @param {*} comment provides a little snarky comment after the score
   * @param {*} container Provide information of how the specified statistic/score is calculated.
   */
  function createCard(score, name, comment, container) {
    let p = gen("text");
    let figure = gen("figure");
    figure.appendChild(p);

    // adjusts perfect integers to integers. Ex: 10.0 -> 10
    if (score % 1 == 0) {
      score = parseInt(score);
    }

    p.innerHTML = "<h3>" + name + " Score: " + score + "/10\n\n"  + "</h3> " + comment ;

    id(container).appendChild(figure);
  }

  // Look up summoner name in API

  /**
   * searhes the summoner ID of the player that has been inputted, and provides
   * graphs and statistics of performance in the last 10 games.
   */
  async function summonerIdSearch() {

    // id("404error").style.display="none";

    searchInput = id("fname").value.replace(/\s/g, ''); // get rid of spaces

    let region = id('selected-item').innerHTML.toLowerCase();

    // Clear all graphs
    id("graphs").innerHTML = "";

    // Loading circle while grabbing data from API
    id("bars6").parentNode.classList.remove("hidden");

    let info = await RiotAPI.getUserData(region, searchInput);

    id("bars6").parentNode.classList.add("hidden");

    var error_id = id("error");

    let test = id(info);
    console.log(test);

    // Error message
    if (info === "error") {
      // id("404error").style.display="block";
      error.innerHTML = "<span style='color: rgb(243, 164, 181);'>"+"Summoner ID not found.</span>";

    } else {
      if (info.gamesFound === 0) {
        error.innerHTML = "<span style='color: rgb(243, 164, 181);'>"+"No ranked games found.</span>"
      }

      // id("profileIMG").src = info.profileIconLink;
      // id("profileIMG").style.display = "block";
      // id("summonerName").innerHTML = info.summoner.name;
      // id("summonerName").style.display = "block";
      // id("summonerLVL").innerHTML = info.summoner.summonerLevel;
      // id("summonerLVL").style.display = "block";

      // Create the graphs!!!
      labels = [" " + info.summoner.name + " (%)", " Teammates (%)"];

      let box1 = newStat(1);
      createGraph(info.killPercentage, labels, "Average % Kills", box1, colors.slice(0,2));
      createGraph(info.damagePercentage, labels, "Average % Damage Dealt to Champions", box1, colors.slice(0,2));

      const ksScore = getKSScore(info.killPercentage, info.damagePercentage);
      createCard(ksScore, "Kill Security", getKSComment(ksScore), box1);
      break_line();

      let box2 = newStat(2);
      createGraph(info.killParticipationPercentage, labels, "Average % Kill Participation", box2, colors.slice(2,4));
      createGraph(info.minionsKilledPercentage, labels, "Average % Minions Killed", box2, colors.slice(2,4));

      const farmScore = getAFKFarmingScore(info.killParticipationPercentage, info.minionsKilledPercentage);
      createCard(farmScore, "AFK Farming", getFarmComment(farmScore), box2);
      break_line();

      let box3 = newStat(3);
      createGraph(info.deathPercentage, labels, "Average % Deaths", box3, colors.slice(4,6));
      createGraph(info.timeSpentDeadPercentage, ["Dead (%)", "Alive (%)"], "Average % Time Spent Dead", box3, colors.slice(4,6));

      const grayScore = getGrayScreenScore(info.deathPercentage, info.timeSpentDeadPercentage);
      createCard(grayScore, "Gray Screener", getGrayComment(grayScore, Math.round(info.timeSpentDeadPercentage)), box3);
      break_line();

      let box4 = newStat(4);
      createGraph(info.visionScorePercentage, labels, "Average % Vision Score", box4, colors.slice(0,2));
      createGraph(info.visionWardsPlacedPercentage, labels, "Average % Vision Wards Placed", box4, colors.slice(0,2));

      const visionScore = getVisionaryScore(info.visionScorePercentage, info.visionWardsPlacedPercentage);
      createCard(visionScore, "Visionary", getVisionComment(visionScore), box4);
    }
  }

  /**
   * Provides text of how much KS (kill secured).
   * @param {float} score The score, 1-10, of the player's KS status (kill secured)
   * @returns the text related to the KS portion.
   */
  function getKSComment(score) {
    let desc = "<br> This score weighs your kills per game and damage contribuation to your team." +
               " The less damage you do compared to your kills, the more effective you are at securing kills." +
               " <br><br><h6>Data is collected over the last 10 ranked games.</h6>";
    let br_i = "<br><i>\"";
    let i_end = "\"</i><br>";
    if (score < 4) {
      return br_i + "What a generous soul..." + i_end + desc;
    } else if (score < 7) {
      return br_i + "Just takes what they deserve, more or less." + i_end + desc;
    } else {
      return br_i + "Thief, burglar, dare I say degenerate." + i_end + desc;
    }
  }

  /**
   * Provides text of the farm (creep score).
   * @param {float} score The score, 1-10, of the player's farm
   * @returns the text related to the farming portion.
   */
  function getFarmComment(score) {
    let desc = "<br> Comparing your kill participation and your minion kills," +
               " the greater the discrepancy, the more likely it is you would" +
               " rather farm minions during your games. <br><br><h6>Data is collected" +
               " over the last 10 ranked games.</h6>";
    let br_i = "<br><i>\"";
    let i_end = "\"</i><br>";

    if (score < 4) {
      return br_i + "Minions are friends, not food." + i_end + desc;
    } else if (score < 7) {
      return br_i + "Financially and fiscally responsible." + i_end + desc;
    } else {
      return br_i + "Can't tell minions and champions apart." + i_end + desc;
    }
  }

  /**
   * Provides text of the grey screen (how long dead).
   * @param {float} score the score, 1-10, of the player's death.
   * @param {float} deathPercent percent of time that the player is dead.
   * @returns the text for gray screen portion.
   */
  function getGrayComment(score, deathPercent) {
    let desc = "<br> As your contribution to your team's total deaths and your average time" +
               " spent out of action increases, so does your gray screen score. <br><br><h6>Data" +
               " is collected over the last 10 ranked games.</h6>";
    let br_i = "<br><i>\"";
    let i_end = "\"</i><br>";

    if (score < 4) {
      return br_i + "Enjoys being alive." + i_end + desc;
    } else if (score < 7) {
      return br_i + "Sometimes the screen goes dark. Not sure why." + i_end + desc;
    } else {
      return br_i + "Imagine being dead " + deathPercent + "% of the game." + i_end + desc;
    }
  }

  /**
   * Provides text of the vision score information text.
   * @param {float} score the vision score.
   * @returns text providing information on the vision score.
   */
  function getVisionComment(score) {
    let desc = "<br> Having a high average vision score percentage of your team and" +
               " a high number of wards placed increases your visionary score. <br><br><br><h6>" +
               "Data is collected over the last 10 ranked games.</h6>";
    let br_i = "<br><i>\"";
    let i_end = "\"</i><br>";

    if (score < 4) {
      return br_i + "Plays with their eyes closed." + i_end + desc;
    } else if (score < 7) {
      return br_i + "Brings a flashlight when camping. Appropriate." + i_end + desc;
    } else {
      return br_i + "Certified ten thousand lumens." + i_end + desc;
    }
  }

  // scores are tuned by experimentation, see test()
  function getKSScore(k, d) {
    const v = k - d;
    return (boundVal(v * 4 + 40, 0, 100) / 10).toFixed(1);
  }

  function getAFKFarmingScore(kp, m) {
    const v = m * 4 - kp / 2;
    return boundVal(v / 8, 0, 10).toFixed(1);
  }

  function getGrayScreenScore(d, t) {
    return boundVal((d + t * t * t) / 200, 0, 10).toFixed(1);
  }

  function getVisionaryScore(s, w) {
    const v = s + w;
    return boundVal(v / 8, 0, 10).toFixed(1);
  }

  function boundVal(v, low, high) {
    return Math.max(Math.min(v, high), low);
  }

  function arrayRotate(arr, reverse) {
    if (reverse) arr.unshift(arr.pop());
    else arr.push(arr.shift());
    return arr;
  }

  function normalizeVal(val, oldMin, oldMax, newMin, newMax) {
    return (((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin
  }

  /**
   * create a graph
   * @param {float} percentage percentage of one of the properties (ex. % average kills)
   * @param {list} labels corresponding labels of each color on the chart. same order as data
   * @param {String} title title of the graph
   * @param {String} htmlContainer the id of the container the graph should be put into
   * @param {list} color list of length 2 that corresponds to the color.
   */
  function createGraph(percentage, labels, title, htmlContainer, color) {
    let figure = gen("figure");
    let canvas = gen("canvas");

    canvas.id = title;

    figure.appendChild(canvas);
    id(htmlContainer).appendChild(figure);

    // graph
    const myChart = new Chart(title, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: 'Graph',
          data: [percentage.toFixed(1), (100 - percentage).toFixed(1)],
          backgroundColor:color,
        }]
      },
      options: {
        layout:{
          padding:{
            bottom: 15
          }
        },
        hoverOffset: 20,
        responsive: true,
        plugins:{
          tooltip: {
            bodyFont: {
              size: 20
            }
          },
          title:{
            display: true,
            text: title,
            color: 'rgb(184, 191, 224)',
            align: 'start',

            padding: {
              bottom: 30
            },

            font:{
              size:20,
              family: "'Spartan', sans-serif"
            },
          },

          legend:{
            display: false,
            position: 'bottom',
            labels:{
              padding: 50,
              color: 'rgb(184, 191, 224)',
              font:{
                size:15
              }
            }
          }
        }
      }
    });
  }


   /**
    * Returns a new element with the given tag name.
    * @param {string} tagName - HTML tag name for new DOM element.
    * @returns {object} New DOM object for given HTML tag.
    */
   function gen(tagName) {
     return document.createElement(tagName);
   }

   /**
    * Returns the element that has the ID attribute with the specified value.
    * @param {string} name - element ID.
    * @returns {object} - DOM object associated with id.
    */
   function id(name) {
     return document.getElementById(name);
   }

   function name(name) {
     return document.getElementsByName(name);
   }

   /**
    * Returns first element matching selector.
    * @param {string} selector - CSS query selector.
    * @returns {object} - DOM object associated selector.
    */
   function qs(selector) {
     return document.querySelector(selector);
   }

   /**
    * Returns an array of elements matching the given query.
    * @param {string} query - CSS query selector.
    * @returns {array} - Array of DOM objects matching the given query.
    */
   function qsa(query) {
     return document.querySelectorAll(query);
   }


 })();
