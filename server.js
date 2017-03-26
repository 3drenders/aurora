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
// Import filesystem 
let fs = require("fs");
// Import BodyParser for parsing data
let bodyParser = require('body-parser');
// Import Request for HTTP requests
let request = require('request');
// Initiate express app
let app = express();
// Import promise support
let Promise = require("bluebird");
// Import await
let nodeAwait = require('await');
// Import Giphy support
let giphy = require('giphy-api')('dc6zaTOxFJmzC');
// Import keyword extractor
let keyword = require("keyword-extractor");
// Import associative keywords
let associative = fs.readFileSync("emotions.json");
associative = JSON.parse(associative);

let ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

let toneAnalyzer = new ToneAnalyzerV3({
    username: '38bfefe8-10b7-4faf-a4dc-af6f8f523c20',
    password: 'qi6JYVQfwS2D',
    version_date: '2016-05-19'
});

// Initiate Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Setup server on port 3000
app.listen(3000);

console.log('Starting Aurora server on port 3000');

app.post('/', function getGif(req, res) {

    //TODO Add type verfification for input

    let text = req.body.text;
    console.log('String received: ' + text);


    let getTone = nodeAwait('tone');
    let getGifs = nodeAwait('selectedEmotion', 'keywords');

    getToneAnalysis(text);

    getTone.then(function(got){

        // Filter tone scores from Watson JSON
        let data = got.tone.document_tone.tone_categories[0].tones;

        // Map them to their values
        let cleanedToneResults = {
            "anger" :   data[0].score,
            "disgust" : data[1].score,
            "fear" :    data[2].score,
            "joy" :     data[3].score,
            "sadness" : data[4].score,
        };

        // Sort from highest to lowest value
        cleanedToneResults = sortProperties(cleanedToneResults);
        let topTone = cleanedToneResults[0][0];
        console.log('Dominant tone is: ' + String(topTone));

        let associativeWords = Object.values(associative[topTone]);
        let selectedEmotion = associativeWords[Math.floor(Math.random() * associativeWords.length)];
        console.log('Selected random emotion is: ' + String(selectedEmotion));

        let keywords = keyword.extract(text, {
            language:"english", 
            remove_digits: true,
            return_changed_case: true,
            remove_duplicates: true
        });
        
        getGifs.keep('selectedEmotion', selectedEmotion);
        getGifs.keep('keywords', keywords);

    },function(err){
        console.log(err);
    });

    getGifs.then(function(got){

        let giphyQuery = got.selectedEmotion;

        for(let i = 0; i < got.keywords.length; i++) {
            console.log('Getting keywords: Keyword ' + String(i) + ' is ' + got.keywords[i]);
            giphyQuery = giphyQuery + ' ' + got.keywords[i];
        }

        console.log('Searching Giphy for query: ' + giphyQuery);

        giphy.search(giphyQuery).then(function (res) {

            let randomUnderTen = Math.floor((Math.random() * 2) + 1);

            let randomGif = res.data[randomUnderTen].images.fixed_height.url;
            sendResponse(randomGif);
        });
    });

    function sendResponse(data){
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data));
    }

    function getToneAnalysis(text){

        console.log('Analyzing tone');

        toneAnalyzer.tone({ text: text },
            function(err, tone) {

                if (err)
                    console.log(err);
                else
                    getTone.keep('tone', tone);
            });
    }

    function sortProperties(obj) {
        // convert object into array
        var sortable=[];
        for(var key in obj)
            if(obj.hasOwnProperty(key))
                sortable.push([key, obj[key]]); // each item is an array in format [key, value]

        // sort items by value
        sortable.sort(function(a, b) {
            return b[1]-a[1]; // compare numbers
        });
        return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
    }
});
