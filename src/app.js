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


    id("bars6").parentNode.classList.remove("hidden");

    let info = await apiService.getMatchesInfo("na1", search_input);  
    
    id("bars6").parentNode.classList.add("hidden");

    console.log(info);

    let arr = [];
    // total kills:
    for (let i = 0; i < 10; i++) {
      arr.push((info.playerStats[i].kills / info.teamStats[0].objectives.champion.kills)* 100);
    }
    // console.log(arr);
    const median = arr => {
      const mid = Math.floor(arr.length / 2),
        nums = [...arr].sort((a, b) => a - b);
      return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    };
    // console.log(median(arr));

    id("graphs").innerHTML = "";
    createGraph(search_input, [median(arr), 100 - median(arr)], labels);

    //summonerid_arr = search_input.split(",").map(item => item.trim());
    // console.log(summonerid_arr);

    
    // summonerid_arr.forEach(summoner => createGraph(summoner));
    // createGraph("graph2");

    // Add function to plug this into riotAPI and then grab data from it

    // apiService.summonerByName('na1', name).then(function(data) {
    //   console.log(data.summonerLevel);
    // });  

  }
  console.log(search_input);

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
  }
 
  var colors = ['rgb(243, 164, 181)', 'rgb(137, 101, 224)', 'rgb(94, 114, 228)', 'rgb(0, 242, 195)']
  
  console.log(labels);

  function createGraph(playerName, data, labels) {
    shuffleArray(colors);
    let figure = gen("figure");
    let canvas = gen("canvas");
    canvas.id = playerName;
    console.log(canvas);
    console.log(id("graphs"));
    figure.appendChild(canvas);
    id("graphs").appendChild(figure);

    const myChart = new Chart(playerName, {
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
