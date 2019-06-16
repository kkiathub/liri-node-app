// read environment variables with dotenv package.
require("dotenv").config();

// import key.js and store its variables.
var keys = require("./key.js");

var moment = require('moment');

// setup spotify package
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);

// Grab the axios package...
var axios = require("axios");

var commandStr = process.argv[2];

// creating titleStr 
var titleStr = process.argv[3];
if (process.argv.length > 4) {
    for (var i = 4; i < process.argv.length; i++) {
        titleStr = titleStr + "+" + process.argv[i];
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
    for(var i=0; i<response.data.length; i++) {
        console.log("event " + (i+1));
        console.log("   Venue : " + response.data[i].venue.name);
        console.log("     City    : " + response.data[i].venue.city);
        console.log("     Region  : " + response.data[i].venue.region);
        console.log("     Country : " + response.data[i].venue.country);
        console.log("   Date of the event : " + moment(response.data[i].datetime).format("MM/DD/YYYY"));
    }
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

switch (commandStr) {
    case "concert-this":
        var queryURL = "https://rest.bandsintown.com/artists/" + titleStr + "/events?app_id=codingbootcamp";
        console.log(queryURL);
        axios.get(queryURL).then(logConcert).catch(logError);
        break;
    case "spotify-this-song":
        break;
    case "movie-this":
        var queryURL = "http://www.omdbapi.com/?t=" + titleStr + "&y=&plot=short&apikey=trilogy";
        axios.get(queryURL).then(logMovie).catch(logError);
        break;
    case "do-what-it-says":
        break;
    default:
        console.log("invalid command!");
        break;
}

