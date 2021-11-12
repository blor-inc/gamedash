"use strict";

// Data collection from API
import * as RiotAPI from "./services/RiotAPI.js";


/// Graph functions
(function() {
  window.addEventListener("load", init);
  let searchInput = "";
  let labels = [];
  let title = "";

  var colors = ['rgb(255, 214, 132, 1)', 'rgb(94, 72, 200,1)', 'rgb(255, 214, 132, 1)',  'rgba(74, 99, 231,1)', 'rgb(255, 214, 132, 1)', 'rgba(247, 84, 84,1)']

  var new_row = "";

  function test() {
    // RiotAPI.getUserData("na1", "phillipjuicyboy").then(console.log);
    let box3 = new_stat(1);
    createGraph([23, 100-23], ["A", "B"], "Test Test", box3, colors.slice(0,2));
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

    console.log("summonerIdSearch")

    searchInput = id("fname").value.replace(/\s/g, '');

    let region = document.getElementById('selected-item').innerHTML.toLowerCase();
    console.log(region);
    


    //clear all graphs
    id("graphs").innerHTML = "";

    // Loading circle while grabbing data from API
    id("bars6").parentNode.classList.remove("hidden");

    let info = await RiotAPI.getUserData(region, searchInput)
    console.log(info);

    id("bars6").parentNode.classList.add("hidden");
    if (info === "error") {
      // id("404error").style.display="block";

    } else {
      if (info.gamesFound === 0) {
        alert("No Ranked games found"); // Need better UI to signal this to user.
        return;
      }
      
      // id("profileIMG").src = info.profileIconLink;
      // id("profileIMG").style.display="block";
      // Create the graphs!!!
      labels = [info.summoner.name, "Teammates"]; // "Team" label is slightly misleading, should express "rest of the team"

      let box1 = new_stat(1);
      createGraph([info.killPercentage, 100 - info.killPercentage], labels, "% Kills of Team", box1, colors.slice(0,2));
      createGraph([info.damagePercentage, 100 - info.damagePercentage], labels, "% Damage of Team", box1, colors.slice(0,2));
      let p1 = gen("p");
      p1.textContent = "KS status: "
      
      if (info.killPercentage - info.damagePercentage >= 8) {
        p1.textContent += "You dirty kser";
      } else {
        p1.textContent += "What a team player!"
      }
      id("row1").appendChild(p1);

      let box2 = new_stat(2);
      createGraph([info.killParticipationPercentage, 100 - info.killParticipationPercentage], labels, "% Kill Participation", box2, colors.slice(2,4));
      createGraph([info.minionsKilledPercentage, 100 - info.minionsKilledPercentage], labels, "% Minions Killed of Team", box2, colors.slice(2,4));

      let p2 = gen("p");
      p2.textContent = "Farmer status: "
      if (info.killParticipationPercentage - info.minionsKilledPercentage <= 10) {
        p2.textContent += "Drop the minions and go help your team!";
      } else {
        p2.textContent += "What a team player!"
      }
      id("row2").appendChild(p2);

      let box3 = new_stat(3);
      createGraph([info.visionScorePercentage, 100 - info.visionScorePercentage], labels, "% Vision Score of Team", box3, colors.slice(4,6));
      createGraph([info.deathPercentage, 100 - info.deathPercentage], labels, "% Deaths", box3, colors.slice(4,6));

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

  }

  function arrayRotate(arr, reverse) {
    if (reverse) arr.unshift(arr.pop());
    else arr.push(arr.shift());
    return arr;
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
          data: data,
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
