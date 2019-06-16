// read environment variables with dotenv package.
require("dotenv").config();

// import key.js and store its variables.
var keys = require("./key.js");

// setup access key information.
var spotify = new spotify(keys.spotify);
// now spotify is available to use.

var commandStr = process.argv[2];

