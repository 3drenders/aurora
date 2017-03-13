/******************
 * SETUP
 *
 * Code for the setup of the project / server
 * Handles Node.js imports and setups, as well as Facebook webhook setuo
 ******************/

// Globably enable strict mode
"use strict";

// Import Express for routing, etc.
let express = require('express');
// Import BodyParser for parsing data
let bodyParser = require('body-parser');
// Import Request for HTTP requests
let request = require('request');
// Initiate express app
let app = express();
// Import promise support
let rp = require('request-promise-native');

// Initiate Bodyparser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Setup server on port 80
app.listen((process.env.PORT || 80));

/**
 * @function redirectToDocs
 * @description Redirects user to documentation if no path is given
 * @param {Object} req Data from request
 * @param {Object} res Results of request
 */
app.get('/', function redirectToDocs(req, res) {
    console.log('Root URL accesed, redirected to documentation');
    res.redirect('https://tijnrenders.github.io/aurora/');
});