var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = 3000
var app = express();
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost/unit18homework", { useNewUrlParser: true });
app.get("/scrape", function (req, res) {
    console.log("test 1")
    axios.get("https://www.espn.com/nba/").then(function (response) {
        console.log("test 2")
        var $ = cheerio.load(response.data);
        var results = {};
        $("section.contentItem__content").each(function (i, element) {
            results.title = $(this)
                .children("a")
                .text();
            results.link = $(this)
                .children("a")
                .attr("href");
        });
        db.Article.create(results)
            .then(function (dbArticle) {
                console.log(dbArticle);
            })
            .catch(function (err) {
                console.log(err);
            });
        res.send("Scrape Complete");
        console.log(results);
    });
});
app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});
app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
