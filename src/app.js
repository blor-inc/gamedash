"use strict";

// Data collection from API
import * as RiotAPI from "./services/RiotAPI.js";


/// Graph functions
(function() {
  window.addEventListener("load", init);
  let searchInput = "";
  let labels = [];
  let title = "";
  var colors = ['rgba(243, 164, 181,0.9)', 'rgba(137, 101, 224,0.9)', 'rgb(94, 114, 228,0.9)', 'rgb(0, 242, 195,0.9)']
  var dropRegion = "";
  var new_row = "";

  function test() {
    RiotAPI.getUserData("na1", "phillipjuicyboy").then(console.log);
  }

  function new_stat(num){
    let new_row = "row" + num;
    let box = gen("div");
    box.id = new_row;
    box.classList.add("box");
    id("graphs").append(box);
    return new_row;
  }

  function init() {
    test();

    let btn = id("button");
    btn.addEventListener("click", summoner_id_search);
    let search_text = id("fname");

    search_text.addEventListener('keypress', function ( event ){
      if (event.key === "Enter"){
        event.preventDefault();
        summoner_id_search();
      }
    })
  }

  async function summoner_id_search() {
    // get data from the textbox search
    searchInput = id("fname").value.replace(/\s/g, '');
    dropRegion = id("regions").value.toLowerCase();

    //clear all graphs
    id("graphs").innerHTML = "";

    // Loading circle while grabbing data from API
    id("bars6").parentNode.classList.remove("hidden");

    let info = await RiotAPI.getUserData(dropRegion, searchInput)
    console.log(info);

    id("bars6").parentNode.classList.add("hidden");

    if (info.gamesFound === 0) {
      alert("No Ranked games found"); // Need better UI to signal this to user.
      return;
    }

    // Create the graphs!!!
    labels = [info.summoner.name, "Team"]; // "Team" label is slightly misleading, should express "rest of the team"

    let box1 = new_stat(1);
    createGraph([info.killPercentage, 100 - info.killPercentage], labels, "Kills", box1);
    createGraph([info.damagePercentage, 100 - info.damagePercentage], labels, "Damage", box1);
    let p1 = gen("p");
    p1.textContent = "KS status: "
    if (info.killPercentage - info.damagePercentage >= 8) {
      p1.textContent += "You dirty kser";
    } else {
      p1.textContent += "What a team player!"
    }
    id("row1").appendChild(p1);


    let box2 = new_stat(2);
    createGraph([info.killParticipationPercentage, 100 - info.killParticipationPercentage], labels, "Kill Participation", box2);
    createGraph([info.minionsKilledPercentage, 100 - info.minionsKilledPercentage], labels, "Minions Killed", box2);

    let p2 = gen("p");
    p2.textContent = "Farmer status: "
    if (info.killParticipationPercentage - info.minionsKilledPercentage <= 10) {
      p2.textContent += "Drop the minions and go help your team!";
    } else {
      p2.textContent += "What a team player!"
    }
    id("row2").appendChild(p2);

    let box3 = new_stat(3);
    createGraph([info.visionScorePercentage, 100 - info.visionScorePercentage], labels, "Vision Score", box3);
    createGraph([info.deathPercentage, 100 - info.deathPercentage], labels, "Deaths", box3);

    let p3 = gen("p");
    p3.textContent = "Vision Status: "
    if (info.visionScorePercentage < 20) {
      p3.textContent += "Get some wards in your system!";
    } else {
      p3.textContent += "What a team player!"
    }
    p3.textContent += "\r\n";
    p3.textContent += "Feeder Status: "
    if (info.deathPercentage >= 23) {
      p3.textContent += "Slow down on the dying!";
    } else {
      p3.textContent += "What a team player!"
    }
    id("row3").appendChild(p3);
  }

  function arrayRotate(arr, reverse) {
    if (reverse) arr.unshift(arr.pop());
    else arr.push(arr.shift());
    return arr;
  }


  function createGraph(data, labels, title, container) {
    // colors = arrayRotate(colors);

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
