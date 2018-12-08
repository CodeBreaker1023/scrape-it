// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});

// Route 1
// =======
// This route will retrieve all of the data
// from the scrapedData collection as a json (this will be populated
// by the data you scrape using the next route)

app.get("/all", function(req, res){
  db.scrapedData.find({}, function(err,data) {
    if (err) {
      console.og(err);
    }
    else {
      res.json(data);
    }
  });
});


// Route 2
// =======
// When you visit this route, the server will
// scrape data from the site of your choice, and save it to
// MongoDB.
// TIP: Think back to how you pushed website data
// into an empty array in the last class. How do you
// push it into a MongoDB collection instead?
// Make a request via axios to grab the HTML body from the site of your choice

app.get("/scrape", function(req, res) {
  // Query: In our database, go to the animals collection, then "find" everything
 axios.get("http://www.espn.com/").then(function(response){
    var $ = cheerio.load(response.data); //parse with cheerio

    $(".headlineStack__list").each(function(i, element) {

      var title = $(element).children().text();
      var link = $(element).find("a").attr("href");
  
      // Save these results in an object that we'll push into the results array we defined earlier
      db.scrapedData.insert({articleTitle: title, articleLink: link})

    });

    $("#articles").append(".headlineStack__list");
  });
});

/* -/-/-/-/-/-/-/-/-/-/-/-/- */

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
