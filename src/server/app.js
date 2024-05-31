var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");

var cardDetails = require("./routes/card_details");

var app = express();
app.use(express.static(path.join(__dirname, "public")));

var http = require("http");
let httpServer = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define routes here
app.use("/api/card-scheme", cardDetails);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Error handler
app.use(function (err, req, res, next) {
  console.error(err.message, err);
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err,
  });
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
module.exports = { app: app, httpServer: httpServer };
