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
  var colors = ['rgb(243, 164, 181)', 'rgb(137, 101, 224)', 'rgb(94, 114, 228)', 'rgb(0, 242, 195)']


  function init() {

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
    labels = [search_input, "Team"];
    console.log(labels);
    console.log(search_input);
    id("graphs").innerHTML = "";

    // Loading circle while grabbing data from API
    id("bars6").parentNode.classList.remove("hidden");

    let info = await apiService.getMatchesInfo("na1", search_input);  
    let damage = await apiService.getMatchesTeamDamage("na1", search_input);
    console.log(damage);

    console.log(info);
    id("bars6").parentNode.classList.add("hidden");

    // total kills:
    let arr = [];
    for (let i = 0; i < 10; i++) {
      arr.push((info.playerStats[i].kills / info.teamStats[0].objectives.champion.kills)* 100);
    }
    const median = arr => {
      const mid = Math.floor(arr.length / 2),
        nums = [...arr].sort((a, b) => a - b);
      return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    };

    // Damage %

    // Create the graphs!!!

    id("graphs").innerHTML = "";

    createGraph(search_input, [median(arr), 100 - median(arr)], labels, "Kill participation");
    createGraph(search_input, [20, 80], labels, "Damage % of team");

  }
  console.log(search_input);

  function arrayRotate(arr, reverse) {
    if (reverse) arr.unshift(arr.pop());
    else arr.push(arr.shift());
    return arr;
  }
 
  
  console.log(labels);

  function createGraph(playerName, data, labels, title) {
    colors = arrayRotate(colors);

    let figure = gen("figure");
    let canvas = gen("canvas");

    canvas.id = title;

    figure.appendChild(canvas);
    
    id("graphs").appendChild(figure);

    const myChart = new Chart(title, {
      type: 'doughnut',
      data: {
        labels: labels,
        opacity:.2,

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
            position: 'bottom'
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
