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
// Import Giphy support
var giphy = require('giphy-api')('dc6zaTOxFJmzC');
// Import keyword extractor
var keyword = require("keyword-extractor");

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
    var getGifs = nodeAwait('toneResults', 'keywords');

    getToneAnalysis(text);

    getTone.then(function (got) {

        var data = got.tone.document_tone.tone_categories[0].tones;

        var cleanedToneResults = {
            "anger": data[0].score,
            "disgust": data[1].score,
            "fear": data[2].score,
            "joy": data[3].score,
            "sadness": data[4].score
        };

        cleanedToneResults = sortProperties(cleanedToneResults);

        var keywords = keyword.extract(text, {
            language: "english",
            remove_digits: true,
            return_changed_case: true,
            remove_duplicates: false

        });

        console.log(keywords);

        getGifs.keep('toneResults', cleanedToneResults);
        getGifs.keep('keywords', keywords);
    }, function (err) {
        console.log(err);
    });

    getGifs.then(function (got) {

        giphy.search(got.toneResults[0][0]).then(function (res) {

            var firstResult = res.data[0].images.fixed_height.url;
            firstResult = firstResult.replace(/\s/g, '');
            sendResponse(firstResult);
        });
    });

    function sendResponse(data) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data));
    }

    function getToneAnalysis(text) {

        console.log('Analyzing tone');

        toneAnalyzer.tone({ text: text }, function (err, tone) {

            if (err) console.log(err);else getTone.keep('tone', tone);
        });
    }

    function sortProperties(obj) {
        // convert object into array
        var sortable = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) sortable.push([key, obj[key]]);
        } // each item is an array in format [key, value]

        // sort items by value
        sortable.sort(function (a, b) {
            return b[1] - a[1]; // compare numbers
        });
        return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
    }
});
