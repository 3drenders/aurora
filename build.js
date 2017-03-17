/******************
 * SETUP
 *
 * Code for the setup of the project / server
 * Handles Node.js imports and setups, as well as Facebook webhook setuo
 ******************/

// Globably enable strict mode
"use strict";

// Import Express for routing, etc.

var express = require('express');
// Import BodyParser for parsing data
var bodyParser = require('body-parser');
// Import Request for HTTP requests
var request = require('request');
// Initiate express app
var app = express();
// Import promise support
var Promise = require("bluebird");
// Import await
var nodeAwait = require('await');

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

var toneAnalyzer = new ToneAnalyzerV3({
    username: '38bfefe8-10b7-4faf-a4dc-af6f8f523c20',
    password: 'qi6JYVQfwS2D',
    version_date: '2016-05-19'
});

// Initiate Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Setup server on port 3000
app.listen(3000);

console.log('Starting Aurora server on port 3000');

/**
 * @function redirectToDocs
 * @description Redirects user to documentation if no path is given
 * @param {Object} req Data from request
 * @param {Object} res Results of request
 */
app.get('/', function redirectToDocs(req, res) {
    console.log('Root URL accesed, redirected to documentation');
    res.redirect('https://github.com/tijnrenders/aurora');
});

app.post('/', function getGif(req, res) {

    var text = req.body.text;
    console.log('String received: ' + text);

    var getTone = nodeAwait('tone');

    toneAnalyzer.tone({ text: text }, function (err, tone) {

        if (err) console.log(err);else getTone.keep('tone', tone);
    });

    getTone.then(function (got) {
        console.log('Analyzing tone');

        var result = {
            "text": text,
            "toneAnalyzer": got.tone,
            "result": "http://coolurl.com"
        };

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));
    }, function (err) {
        console.log(err);
    });
});
