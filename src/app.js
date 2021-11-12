"use strict";

// Data collection from API
import * as RiotAPI from "./services/RiotAPI.js";


/// Graph functions
(function() {
  window.addEventListener("load", init);
  let searchInput = "";
  let labels = [];
  var colors = ['rgb(255, 214, 132, 1)', 'rgb(94, 72, 200,1)', 'rgb(255, 214, 132, 1)',  'rgba(74, 99, 231,1)', 'rgb(255, 214, 132, 1)', 'rgba(247, 84, 84,1)']

  function test() {
    // API test
    // RiotAPI.getUserData("na1", "nubwett").then(console.log);

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

  function newStat(num){
    let new_row = "row" + num;
    let box = gen("div");
    box.id = new_row;
    box.classList.add("box");
    id("graphs").append(box);
    return new_row;
  }

  function init() {
    test();

    let search_text = id("fname");

    search_text.addEventListener('keypress', function ( event ){
      if (event.key === "Enter"){
        event.preventDefault();
        summonerIdSearch();
      }
    })

    let items = document.getElementsByName('item');
    let selectedItem = document.getElementById('selected-item');
    let dropdown = document.getElementById('dropdown');

    items.forEach(item => {
      item.addEventListener('change', () => {
        if (item.checked) {
          selectedItem.innerHTML = item.value;
          dropdown.open = false;
        }
      });
    });
  }

  async function summonerIdSearch() {

    // id("404error").style.display="none";

    searchInput = id("fname").value.replace(/\s/g, '');

    let region = document.getElementById('selected-item').innerHTML.toLowerCase();

    //clear all graphs
    id("graphs").innerHTML = "";

    // Loading circle while grabbing data from API
    id("bars6").parentNode.classList.remove("hidden");

    let info = await RiotAPI.getUserData(region, searchInput)

    id("bars6").parentNode.classList.add("hidden");
    if (info === "error") {
      // id("404error").style.display="block";

    } else {
      if (info.gamesFound === 0) {
        alert("No Ranked games found"); // Need better UI to signal this to user.
        return;
      }
      
      id("profileIMG").src = info.profileIconLink;
      id("profileIMG").style.display="block";

      // Create the graphs!!!
      labels = [info.summoner.name + " (%)", "teammates (%)"];

      let box1 = newStat(1);
      createGraph([info.killPercentage, 100 - info.killPercentage], labels, "Average % Kills", box1, colors.slice(0,2));
      createGraph([info.damagePercentage, 100 - info.damagePercentage], labels, "Average % Damage Dealt to Champions", box1, colors.slice(0,2));
      const ksScore = getKSScore(info.killPercentage, info.damagePercentage);
      createCard(ksScore, "Kill Security", getKSComment(ksScore), box1);

      let box2 = newStat(2);
      createGraph([info.killParticipationPercentage, 100 - info.killParticipationPercentage], labels, "Average % Kill Participation", box2, colors.slice(2,4));
      createGraph([info.minionsKilledPercentage, 100 - info.minionsKilledPercentage], labels, "Average % Minions Killed", box2, colors.slice(2,4));
      const farmScore = getAFKFarmingScore(info.killParticipationPercentage, info.minionsKilledPercentage);
      createCard(farmScore, "AFK Farming", getFarmComment(farmScore), box2);

      let box3 = newStat(3);
      createGraph([info.deathPercentage, 100 - info.deathPercentage], labels, "Average % Deaths", box3, colors.slice(4,6));
      createGraph([info.timeSpentDeadPercentage, 100 - info.timeSpentDeadPercentage], ["Dead (%)", "Alive (%)"], "Average % Time Spent Dead", box3, colors.slice(4,6));
      const grayScore = getGrayScreenScore(info.deathPercentage, info.timeSpentDeadPercentage);
      createCard(grayScore, "Gray Screen Gaming", getGrayComment(grayScore, Math.round(info.timeSpentDeadPercentage)), box3);

      let box4 = newStat(4);
      createGraph([info.visionScorePercentage, 100 - info.visionScorePercentage], labels, "Average % Vision Score", box4, colors.slice(0,2));
      createGraph([info.visionWardsPlacedPercentage, 100 - info.visionWardsPlacedPercentage], labels, "Average % Vision Wards Placed", box4, colors.slice(0,2));
      const visionScore = getVisionaryScore(info.visionScorePercentage, info.visionWardsPlacedPercentage);
      createCard(visionScore, "Visionary", getVisionComment(visionScore), box4);
    }

  }

  function getKSComment(score) {
    if (score < 4) {
      return "What a generous soul...";
    } else if (score < 7) {
      return "Just takes what they deserve, more or less.";
    } else {
      return "Thief, burglar, dare I say degenerate.";
    }
  }

  function getFarmComment(score) {
    if (score < 4) {
      return "Minions are friends, not food.";
    } else if (score < 7) {
      return "Financially and fiscally responsible."
    } else {
      return "Can't tell minions and champions apart.";
    }
  }

  function getGrayComment(score, deathPercent) {
    if (score < 4) {
      return "Enjoys being alive.";
    } else if (score < 7) {
      return "Sometimes the screen goes dark. Not sure why."
    } else {
      return "Imagine being dead " + deathPercent + "% of the game.";
    }
  }

  function getVisionComment(score) {
    if (score < 4) {
      return "Plays with their eyes closed.";
    } else if (score < 7) {
      return "Brings a flashlight when camping. Appropriate."
    } else {
      return "Certified ten thousand lumens.";
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

  function createCard(score, name, comment, container) {
    let p = gen("p");
    p.textContent = name + " Score: " + score + "/10\n\n" + comment;
    id(container).appendChild(p);
  }

  function createGraph(data, labels, title, htmlContainer, color) {
    // Data: array length 2 of two percentages
    // Labels: corresponding labels of each color on the chart. same order as data
    // Title: title of the graph
    // htmlContainer: which container in html the graph should be put into
    // Color: array of size 2 of the colors used in the chart.
    // colors = arrayRotate(colors);

    let figure = gen("figure");
    let canvas = gen("canvas");

    canvas.id = title;

    figure.appendChild(canvas);
    id(htmlContainer).appendChild(figure);


    const myChart = new Chart(title, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: 'Graph',
          data: data.map(d => d.toFixed(1)),
          backgroundColor:color,
        }]
      },
      options: {
        hoverOffset: 6,
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
              size:15,
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
