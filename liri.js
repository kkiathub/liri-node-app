const LINE = "------------------------------------\n";


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

// if logCommand is true, it will log the command entered to file.
function logFnc(msg, logCommand = false) {
    // log to terminal.
    console.log(msg);

    // log to file
    if (logCommand) {
        msg = "Command entered : node liri.js " + process.argv.slice(2).join(" ") + "\n" + msg;
    }
    fs.appendFile("log.txt", msg, function (err) {

        // If an error was experienced we will log it.
        if (err) {
            console.log(err);
        }
    });
}

function logMovie(response) {
    if (response.data.Response == "False") {
        logFnc("Movie Not Found!\n" + LINE);
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
    var logMsg = "\tTitle: " + response.data.Title + "\n";
    logMsg += ("\tYear Released : " + response.data.Year + "\n");
    logMsg += ("\tIMDB Rating " + response.data.imdbRating + "\n");
    logMsg += ("\tRotten Tomatoes Rating : " + tomatoRating + "\n");
    logMsg += ("\tCountry : " + response.data.Country + "\n");
    logMsg += ("\tLanguage : " + response.data.Language + "\n");
    logMsg += ("\tPlot : " + response.data.Plot + "\n");
    logMsg += ("\tActors : " + response.data.Actors + "\n");
    logMsg += LINE;
    logFnc(logMsg, true);
}

function logConcert(response) {
    // console.log(response.data);
    var logMsg = response.data.length + " events found!\n";
    for (var i = 0; (i < response.data.length) && (i<5) ; i++) {
        logMsg += ("event " + (i + 1) + "\n");
        logMsg += ("\tVenue   : " + response.data[i].venue.name + "\n");
        logMsg += ("\tCity    : " + response.data[i].venue.city + "\n");
        logMsg += ("\tRegion  : " + response.data[i].venue.region + "\n");
        logMsg += ("\tCountry : " + response.data[i].venue.country + "\n");
        logMsg += ("\tDate of the event : " + moment(response.data[i].datetime).format("MM/DD/YYYY") + "\n");
    }
    logMsg += LINE;
    logFnc(logMsg, true);
}

function logSong(response) {
    // console.log(response);
    if (response.tracks.items.length === 0) {
        logFnc("Song Not Found!\n" + LINE);
        return;
    }

    // A preview link of the song from Spotify
    var previewLink = response.tracks.items[0].preview_url;
    if (previewLink === null) {
        previewLink = "N/A";
    }
    var logMsg = "Artist(s) : " + response.tracks.items[0].artists[0].name + "\n";
    logMsg += ("Song's name : " + response.tracks.items[0].name + "\n");
    logMsg += ("Preview link : " + previewLink + "\n");
    logMsg += ("Album : " + response.tracks.items[0].album.name + "\n");
    logMsg += LINE;
    logFnc(logMsg, true);
}

function logError(error) {
    var logMsg = "";
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        logMsg += (error.response.data + "\n");
        logMsg += (error.response.status + "\n");
        logMsg += (error.response.header + "\n");
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an object that comes back with details pertaining to the error that occurred.
        logMsg += (error.request + "\n");
    } else {
        // Something happened in setting up the request that triggered an Error
        logMsg += ("Error : " + error.message + "\n");
    }
    logMsg += (error.config + "\n");
    logMsg += LINE;
    logFnc(logMsg);
}

function displayCommands(header) {
    var logMsg = "";
    if (header) {
        logMsg += header + "\n";
    }
    logMsg += "Please enter one of the following commands!\n";
    logMsg += "\tnode liri.js concert-this <artist/band name>\n";
    logMsg += "\tnode liri.js spotify-this-song <song name>\n";
    logMsg += "\tnode liri.js movie-this <movie name>\n";
    logMsg += "\tnode liri.js do-what-it-says\n";
    logMsg += LINE;
    logFnc(logMsg);
}

function readCommandsFromFile(filename) {
    fs.readFile(filename, "utf8", function (error, data) {

        // If the code experiences any errors it will log the error to the console.

        if (error) {
            logFnc(error);
            return;
        }

        // We will then print the contents of data. data is a string.
        // console.log(data);

        // Then split it by commas (to make it more readable)
        var dataArr = data.split(",");

        // Extracting command and argument.
        var datStr = "";
        var newLineIdx = dataArr[1].search(/\n/);
        if (newLineIdx>0) {
            // there are multiple lines in the file.  only read the 1st line.
            datStr = dataArr[1].slice(0, newLineIdx);
        } else {
            // only 1 line in the file.
            datStr = dataArr[1];
        }
        datStr = datStr.replace(/"/g, "");
        runCommand(dataArr[0], datStr);

    });
}

function runCommand(cmd, arg) {

    switch (cmd) {
        case "concert-this":
            if (arg.length === 0) {
                // if no artist nor band specified, it will ask the user to enter it.
                logFnc("Please enter artist or band name!\n" + LINE);
                break;
            }
            var queryURL = "https://rest.bandsintown.com/artists/" + arg + "/events?app_id=codingbootcamp";
            axios.get(queryURL).then(logConcert).catch(logError);
            break;
        case "spotify-this-song":
            // if no song entered, it will search "The Sign by Ace of base"
            if (arg.length === 0) {
                arg = "The Sign Ace of base";
            }
            spotify.search({ type: 'track', query: arg }).then(logSong).catch(logError);
            break;
        case "movie-this":
            // if no movie entered, it will search "Mr. Nobody"
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
            // will display all command usage.
            displayCommands("**** invalid command! ****");
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
