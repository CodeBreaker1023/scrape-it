// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

var port = process.env.PORT || 3000;

const mongoose = require('mongoose');
// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/scraper", { useNewUrlParser: true });

mongoose.connection.on('connected', () => {
  console.log('Connect to Database ');
})
mongoose.connection.on('error', (err) => {
  console.log(`error connecting to db ${err}`);
})

var db = mongoose.connection;
// Initialize Express
var app = express();

app.use(express.static('public'));

// // Database configuration
// var databaseUrl = "scraper";
// var collections = ["scrapedData"];

// // Hook mongojs configuration to the db variable
// var db = mongojs(databaseUrl, collections);
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  // res.send("Hello world");
  // res.sendFile(__dirname + '/public/index.html');
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
 axios.get("https://www.coindesk.com/category/technology-news/").then(function(response){
    var $ = cheerio.load(response.data); //parse with cheerio

      $(".stream-article").each(function(i, element) {
        var title = $(element).attr("title");
        console.log("Title: "+title);
        var image = $(element).children("div").children("img").attr("src");
        console.log("Image source: "+image);
        // var t = $(element).children().text();
        // var link = $(element).find("a").attr("href");
        var link = $(element).attr("href");
        console.log("Link: "+link);
      
      // coins and price chart
      $(".sidebar-price-widget-v2-list-item__meta").each(function(i,element) {
        var coin = $(element).children().text();
        console.log("coin:" + coin);
        var price = $(element).children(".sidebar-price-widget-v2-list-item__data").children("span").text();
        console.log("price:" + price);
      })
   
      db.scrapedData.insert({
        title: title,
        image: image, 
        link: link,
        coin: coin,
        price: price
      }, function(err, found){
        if (err) {
          console.log(err);
        }
        else {
          console.log(title); 
        }
      });
    });
    console.log("Finished scraping");
    res.send("Finished scraping")
  });
});

// Handle form submission, save submission to mongo
app.post("/submit", function(req, res) {
  console.log(req.body);
  // Insert the note into the notes collection
  db.notes.insert(req.body, function(error, saved) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    else {
      // Otherwise, send the note back to the browser
      // This will fire off the success function of the ajax request
      res.send(saved);
    }
  });
});

/* -/-/-/-/-/-/-/-/-/-/-/-/- */

// Listen on port 3000
app.listen(port, function() {
  console.log("App running on port 3000!");
});