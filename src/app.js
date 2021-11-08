 "use strict";
 import * as apiService from "./services/RiotAPI.js";
 (function() {
   window.addEventListener("load", init);

   function init() {
     console.log(apiService.getallSummonerGames("americas", 'FelliDLGt30fA25eIDAIqgqe1qTysMVAmD4vvVhbztHoxIakFlLMpWxZxny7G_ZeN5mtab6ACdWFzw'));
     id("start-btn").addEventListener("click", startGame);
     id("back-btn").addEventListener("click", endGame);
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
