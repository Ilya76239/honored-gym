/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

module.exports = function(app) {
  app
    .route("/api/books")
    .get(function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        err ? console.err(err) : null;
        var collection = db.collection("books");
        collection.aggregate(
          [
            {
              $project: {
                _id: 1,
                title: 1,
                commentcount: { $size: "$comments" }
              }
            }
          ],
          (err, results) => {
            res.json(results);
            db.close();
          }
        );
      });
    })

    .post(function(req, res) {
      //response will contain new book object including atleast _id and title
      var title = req.body.title;
      if (!title) {
        res.send("title is required");
        return;
      }

      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        err ? console.err(err) : null;
        var collection = db.collection("books");
        collection.insertOne({ title: title, comments: [] }, (err, results) => {
          if (err) console.err(err);
          res.json(results.ops[0]);
          db.close();
        });
      });
    })

    .delete(function(req, res) {
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        err ? console.err(err) : null;
        var collection = db.collection("books");
        collection.drop((err, reply) => {
          db.listCollections().toArray(function(err, replies) {
            var found = false;
            // For each collection in the list of collection names in this db look for the
            // dropped collection
            replies.forEach(function(document) {
              if (document.name == "test_other_drop") {
                found = true;
                return;
              }
            });

            let response = found
              ? "complete delete unsuccessful"
              : "complete delete successful";
            res.send(response);
            db.close();
          });
        });
      });
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
      var bookid = req.params.id;
      if (!ObjectId.isValid(bookid)) {
        res.send("no book found");
        return;
      }
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        err ? console.err(err) : null;
        var collection = db.collection("books");
        collection.findOne({ _id: ObjectId(bookid) }, (err, doc) => {
          doc ? res.json(doc) : res.send("no book found");
          db.close();
        });
      });
    })

    .post(function(req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      if (!ObjectId.isValid(bookid)) {
        res.send("no book found");
        return;
      }
      //json res format same as .get
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        err ? console.err(err) : null;
        var collection = db.collection("books");
        collection.findOneAndUpdate(
          { _id: ObjectId(bookid) },
          { $push: { comments: comment } },
          { returnOriginal: false },
          (err, doc) => {
            res.json(doc.value);
            db.close();
          }
        );
      });
    })

    .delete(function(req, res) {
      var bookid = req.params.id;
      if (!ObjectId.isValid(bookid)) {
        res.send("no book found");
        return;
      }
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        err ? console.err(err) : null;
        var collection = db.collection("books");
        collection.findOneAndDelete(
          { _id: ObjectId(bookid) },
          (err, result) => {
            err ? res.send(err) : res.send("delete successful");
            db.close();
          }
        );
      });
    });
};
