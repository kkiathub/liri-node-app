// choose where the output will be logged to.
const LOG_TO_FILE = true;
var logFnc =  LOG_TO_FILE?logToFile:console.log;


// read environment variables with dotenv package.
require("dotenv").config();

// import key.js and store its variables.
var keys = require("./key.js");

var moment = require('moment');

// fs is a core Node package for reading and writing files
var fs = require("fs")

// setup spotify package
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);

// Grab the axios package...
var axios = require("axios");

// creating titleStr 
var titleStr = "";
if (process.argv.length > 3) {
    var titleStr = process.argv.slice(3).join(" ");
}

function logToFile(text) {
    fs.appendFileSync("log.txt", text + "\n", function (err) {

        // If an error was experienced we will log it.
        if (err) {
            console.log(err);
        }
    });
}

function logEndLine() {
    logFnc("--------------------------------\n");
}


function logMovie(response) {
    if (response.data.Response == "False") {
        logFnc("Movie Not Found!");
        logEndLine();
        return;
    }

    var tomatoRating = "N/A";
    for (var i = 0; i < response.data.Ratings.length; i++) {
        if (response.data.Ratings[i].Source === "Rotten Tomatoes") {
            tomatoRating = response.data.Ratings[i].Value;
            break;
        }
    }

    // console.log(response.data);
    logFnc("Title: " + response.data.Title);
    logFnc("Year Released : " + response.data.Year);
    logFnc("IMDB Rating " + response.data.imdbRating);
    logFnc("Rotten Tomatoes Rating : " + tomatoRating);
    logFnc("Country : " + response.data.Country);
    logFnc("Language : " + response.data.Language);
    logFnc("Plot : " + response.data.Plot);
    logFnc("Actors : " + response.data.Actors);
    logEndLine();
}

function logConcert(response) {
    // console.log(response.data);
    logFnc(response.data.length + " events found!");
    for (var i = 0; i < response.data.length; i++) {
        logFnc("event " + (i + 1));
        logFnc("   Venue : " + response.data[i].venue.name);
        logFnc("     City    : " + response.data[i].venue.city);
        logFnc("     Region  : " + response.data[i].venue.region);
        logFnc("     Country : " + response.data[i].venue.country);
        logFnc("   Date of the event : " + moment(response.data[i].datetime).format("MM/DD/YYYY"));
    }
    logEndLine();
}

function logSong(response) {
    // console.log(response);
    if (response.tracks.items.length === 0) {
        logFnc("Song not found!");
        logEndLine();
        return;
    }
    // console.log(response.tracks.items[0]);
    // Artist(s)
    logFnc("Artist(s) : " + response.tracks.items[0].artists[0].name);
    // The song's name
    logFnc("Song's name : " + response.tracks.items[0].name);

    // A preview link of the song from Spotify
    var previewLink = response.tracks.items[0].preview_url;
    if (previewLink === null) {
        previewLink = "N/A";
    }

    logFnc("Preview link : " + previewLink);

    // The album that the song is from
    logFnc("Album : " + response.tracks.items[0].album.name);
    logEndLine();
}

function logError(error) {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
       logFnc(error.response.data);
       logFnc(error.response.status);
       logFnc(error.response.headers);
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an object that comes back with details pertaining to the error that occurred.
       logFnc(error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
       logFnc("Error", error.message);
    }
   logFnc(error.config);
   logEndLine();
}

function displayCommands() {
    logFnc("Please enter one of the following commands!");
    logFnc("node liri.js concert-this <artist/band name>");
    logFnc("node liri.js spotify-this-song <song name>");
    logFnc("node liri.js movie-this <movie name>");
    logFnc("node liri.js do-what-it-says");
    logEndLine();
}

function readCommandsFromFile(filename) {
    fs.readFile(filename, "utf8", function (error, data) {

        // If the code experiences any errors it will log the error to the console.

        if (error) {
            return console.log(error);
        }

        // We will then print the contents of data. data is a string.
        // console.log(data);

        // Then split it by commas (to make it more readable)
        var dataArr = data.split(",");

        // Extracting command and argument.
        var cmdStr = dataArr[0];
        var datStr = dataArr[1].replace(/"/g, "");
        runCommand(dataArr[0], datStr);

    });
}

function runCommand(cmd, arg) {

    switch (cmd) {
        case "concert-this":
            if (arg.length === 0) {
                // if no artist nor band specified, it will ask the user to enter it.
                logFnc("Please enter artist or band name!");
                break;
            }
            var queryURL = "https://rest.bandsintown.com/artists/" + arg + "/events?app_id=codingbootcamp";
            axios.get(queryURL).then(logConcert).catch(logError);
            break;
        case "spotify-this-song":
            if (arg.length === 0) {
                arg = "The Sign Ace of base";
            }
            spotify.search({ type: 'track', query: arg }).then(logSong).catch(logError);
            break;
        case "movie-this":
            if (arg.length === 0) {
                arg = "Mr. Nobody";
            }
            var queryURL = "http://www.omdbapi.com/?t=" + arg + "&y=&plot=short&apikey=trilogy";
            axios.get(queryURL).then(logMovie).catch(logError);
            break;
        case "do-what-it-says":
            readCommandsFromFile("random.txt");
            break;
        default:
            logFnc("**** invalid command! ****");
            // will display all command usage.
            displayCommands();
            break;
    }
}

// run this.

if (process.argv.length === 2) {
    // if user did not enter command , it would log all command usage.
    displayCommands();
} else {
    runCommand(process.argv[2], titleStr);
}
