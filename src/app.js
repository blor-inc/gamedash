"use strict";

// Data collection from API
import * as apiService from "./services/RiotAPI.js";

// var name = "brokenpancake"

// apiService.summonerByName('na1', name).then(function(data) {
//   console.log(data.summonerLevel);
// });


/// Graph functions
(function() {
  window.addEventListener("load", init);
  let search_input = "";
  let labels = [];
  let title = "";
  var colors = ['rgba(243, 164, 181,0.9)', 'rgba(137, 101, 224,0.9)', 'rgb(94, 114, 228,0.9)', 'rgb(0, 242, 195,0.9)']
  var drop_region = "";
  var new_row = "";

  function new_stat(num){
    let new_row = "row" + num;
    let box = gen("div");
    box.id = new_row;
    box.classList.add("box");
    id("graphs").append(box);
    return new_row;
  }

  function init() {
    // createGraph("Test Graph", [50,50], ["A", "B"], "Test Graph Title")

    let btn = id("button");
    btn.addEventListener("click", summoner_id_search);
    let search_text = id("fname");

    search_text.addEventListener('keypress', function ( event ){
      let key = event.keyCode;
      if (key === 32) {
        event.preventDefault();
      }
      if (event.key === "Enter"){
        event.preventDefault();
        summoner_id_search();
      }
    })

  }      

  async function summoner_id_search() {
    // get data from the textbox search
    search_input = id("fname").value;
    labels = [search_input, "Team"]; // "Team" label is slightly misleading, should express "rest of the team"
    drop_region = id("regions").value.toLowerCase();

    //clear all graphs
    id("graphs").innerHTML = "";

    // Loading circle while grabbing data from API
    id("bars6").parentNode.classList.remove("hidden");

    let info = await apiService.getMatchesInfo(drop_region, search_input);

    if (!info.gamesFound) {
      alert("No Ranked games found"); // Need better UI to signal this to user.
    }

    let dmgPercentages = await apiService.getMatchesDmgPercentage(drop_region, search_input);
    console.log(dmgPercentages);

    console.log(info);
    id("bars6").parentNode.classList.add("hidden");

    // array of kill percentages:
    let killPercentages = [];
    for (let i = 0; i < 10; i++) {
      killPercentages.push((info.playerStats[i].kills / info.teamStats[i].objectives.champion.kills)* 100);
    }
    const median = killPercentages => {
      const mid = Math.floor(killPercentages.length / 2),
        nums = [...killPercentages].sort((a, b) => a - b);
      return killPercentages.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    };

    // Damage %
    // Create the graphs!!!

    id("graphs").innerHTML = "";

    let box1 = new_stat(1);
    createGraph(search_input, [median(killPercentages), 100 - median(killPercentages)], labels, "Kills", box1);
    createGraph(search_input, [median(dmgPercentages), 100 - median(dmgPercentages)], labels, "Damage", box1);
        
    let box2 = new_stat(2);
    createGraph(search_input, [50,50], labels, "Kill Participation", box2);
    createGraph(search_input, [50,50], labels, "Gold Farmed", box2);
  }

  function arrayRotate(arr, reverse) {
    if (reverse) arr.unshift(arr.pop());
    else arr.push(arr.shift());
    return arr;
  }


  function createGraph(playerName, data, labels, title, container) {
    colors = arrayRotate(colors);

    let figure = gen("figure");
    let canvas = gen("canvas");

    canvas.id = title;

    figure.appendChild(canvas);
    id(container).appendChild(figure);


    const myChart = new Chart(title, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: 'Graph',
          data: data,
          backgroundColor:colors,
        }]
      },
      options: {
        hoverOffset: 6,
        responsive: true,
        plugins:{

          title:{
            display: true,
            text: title,
            color: '#adb5bd',
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
            position: 'bottom',
            labels:{
              padding: 50,
              font:{
                size:15,
                color:'white'
              }
            }
          }
        }
      }
    });
    // all_charts.push(myChart);
  
    return myChart;
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
