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
    var titleStr = process.argv[3];
    if (process.argv.length > 4) {
        for (var i = 4; i < process.argv.length; i++) {
            titleStr = titleStr + " " + process.argv[i];
        }
    }
}


function logMovie(response) {
    if (response.data.Response == "False") {
        console.log("Movie Not Found!");
        return;
    }
    // console.log(response.data);
    console.log("Title: " + response.data.Title);
    console.log("Year Released : " + response.data.Year);
    console.log("IMDB Rating " + response.data.imdbRating);
    var tomatoRating = "N/A";
    for (var i = 0; i < response.data.Ratings.length; i++) {
        if (response.data.Ratings[i].Source === "Rotten Tomatoes") {
            tomatoRating = response.data.Ratings[i].Value;
            break;
        }
    }
    console.log("Rotten Tomatoes Rating : " + tomatoRating);
    console.log("Country : " + response.data.Country);
    console.log("Language : " + response.data.Language);
    console.log("Plot : " + response.data.Plot);
    console.log("Actors : " + response.data.Actors);
}

function logConcert(response) {
    // console.log(response.data);
    console.log(response.data.length + " events found!");
    for (var i = 0; i < response.data.length; i++) {
        console.log("event " + (i + 1));
        console.log("   Venue : " + response.data[i].venue.name);
        console.log("     City    : " + response.data[i].venue.city);
        console.log("     Region  : " + response.data[i].venue.region);
        console.log("     Country : " + response.data[i].venue.country);
        console.log("   Date of the event : " + moment(response.data[i].datetime).format("MM/DD/YYYY"));
    }
}

function logSong(response) {
    // console.log(response);
    if (response.tracks.items.length === 0) {
        console.log("Song not found!");
        return;
    }
    // console.log(response.tracks.items[0]);
    // Artist(s)
    console.log("Artist(s) : " + response.tracks.items[0].artists[0].name);
    // The song's name
    console.log("Song's name : " + response.tracks.items[0].name);

    // A preview link of the song from Spotify
    var previewLink = response.tracks.items[0].preview_url;
    if (previewLink === null) {
        previewLink = "N/A";
    }

    console.log("Preview link : " + previewLink);

    // The album that the song is from
    console.log("Album : " + response.tracks.items[0].album.name);
}

function logError(error) {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an object that comes back with details pertaining to the error that occurred.
        console.log(error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
    }
    console.log(error.config);
}

function displayCommands() {
    console.log("Please enter one of the following commands!");
    console.log("node liri.js concert-this <artist/band name>");
    console.log("node liri.js spotify-this-song <song name>");
    console.log("node liri.js movie-this <movie name>");
    console.log("node liri.js do-what-it-says");
}

function readCommands(filename) {
    fs.readFile(filename, "utf8", function(error, data) {

        // If the code experiences any errors it will log the error to the console.
      
        if (error) {
          return console.log(error);
        }
      
        // We will then print the contents of data. data is a string.
        // console.log(data);
      
        // Then split it by commas (to make it more readable)
        var dataArr = data.split(",");
      
        // We will then re-display the content as an array for later use.
        var cmdStr = dataArr[0];
        var datStr = dataArr[1].replace(/"/g, "");
        runCommand(dataArr[0], datStr);
      
      });
}

function runCommand(cmd, arg) {

    switch (cmd) {
        case "concert-this":
            if (arg.length === 0) {
                console.log("Please enter artist or band name!");
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
            readCommands("random.txt");
            break;
        default:
            console.log("**** invalid command! ****");
            displayCommands();
            break;
    }
}

// run this.

if (process.argv.length === 2) {
    displayCommands();
} else {
    runCommand(process.argv[2], titleStr);
}
