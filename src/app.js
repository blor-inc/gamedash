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
  let summonerid_arr = [];

  function init() {
    let btn = id("button");
    btn.addEventListener("click", summoner_id_search);
  }


function summoner_id_search() {
  id("graphs").innerHTML = "";

  // get data from the textbox search
  let search_input = id("myText").value;
  console.log(search_input);

  summonerid_arr = search_input.split(",").map(item => item.trim());
  console.log(summonerid_arr);

  summonerid_arr.forEach(summoner => createGraph(summoner));
  // createGraph("graph1");
  // createGraph("graph2");

  // Add function to plug this into riotAPI and then grab data from it

  // apiService.summonerByName('na1', name).then(function(data) {
//   console.log(data.summonerLevel);
// });

// Add function to turn data into scatterplot points:
// data: [{
//   x: 10,
//   y: 20
// }, {
//   x: 15,
//   y: 10
// }]

}

  function createGraph(playerName) {
    let figure = gen("figure");
    let canvas = gen("canvas");
    canvas.id = playerName;
    console.log(canvas);
    console.log(id("graphs"));
    figure.appendChild(canvas);
    id("graphs").appendChild(figure);

  
    const myChart = new Chart(playerName, {
      type: 'scatter',
      data: {
        labels: summonerid_arr,
        datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
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
