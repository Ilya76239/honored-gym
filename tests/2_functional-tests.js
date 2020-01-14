/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function() {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test("#example Test GET /api/books", function(done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        assert.property(
          res.body[0],
          "commentcount",
          "Books in array should contain commentcount"
        );
        assert.property(
          res.body[0],
          "title",
          "Books in array should contain title"
        );
        assert.property(
          res.body[0],
          "_id",
          "Books in array should contain _id"
        );
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function() {
    var testID = null;
    suite(
      "POST /api/books with title => create book object/expect book object",
      function() {
        test("Test POST /api/books with title", function(done) {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "Test book" })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.property(res.body, "title", "Book should contain title");
              assert.property(res.body, "_id", "Book should contain _id");
              assert.property(
                res.body,
                "comments",
                "Book should contain comments"
              );
              assert.isArray(res.body.comments, "Comments should be an array");
              assert.equal(res.body.title, "Test book");
              testID = res.body._id;
              done();
            });
        });

        test("Test POST /api/books with no title given", function(done) {
          chai
            .request(server)
            .post("/api/books")
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "title is required");
              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", function() {
      test("Test GET /api/books", function(done) {
        chai
          .request(server)
          .get("/api/books")
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, "response should be an array");
            assert.property(
              res.body[0],
              "commentcount",
              "Books in array should contain commentcount"
            );
            assert.property(
              res.body[0],
              "title",
              "Books in array should contain title"
            );
            assert.property(
              res.body[0],
              "_id",
              "Books in array should contain _id"
            );
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function() {
      test("Test GET /api/books/[id] with id not in db", function(done) {
        chai
          .request(server)
          .get("/api/books/123467890")
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book found");
            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function(done) {
        chai
          .request(server)
          .get("/api/books/" + testID)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, "_id");
            assert.property(
              res.body,
              "comments",
              "response should contain property id"
            );
            assert.property(
              res.body,
              "title",
              "response should contain property title"
            );
            assert.property(
              res.body,
              "comments",
              "response should contain property comments"
            );
            assert.isArray(res.body.comments, "Comments should be an array");
            assert.equal(res.body._id, testID);
            assert.equal(res.body.title, "Test book");
            done();
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function() {
        test("Test POST /api/books/[id] with comment", function(done) {
          chai
            .request(server)
            .post("/api/books/" + testID)
            .send({ comment: "Test comment" })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.property(
                res.body,
                "_id",
                "response should contain property _id"
              );
              assert.property(
                res.body,
                "title",
                "response should contain property title"
              );
              assert.property(
                res.body,
                "comments",
                "response should contain property comments"
              );
              assert.isArray(res.body.comments, "Comments should be an array");
              assert.equal(res.body._id, testID);
              assert.equal(res.body.title, "Test book");
              assert.include(
                res.body.comments,
                "Test comment",
                "Test comment should be included in comments"
              );

              done();
            });
        });
      }
    );
  });
});
