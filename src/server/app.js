const express = require("express"); // Import the Express framework
const path = require("path"); // Import the path module for handling file and directory paths
const bodyParser = require("body-parser"); // Import body-parser for parsing request bodies
const cardDetails = require("./routes/card_details"); // Import the routes for card details

const app = express(); // Create an Express application
const http = require("http"); // Import the http module
const httpServer = http.createServer(app); // Create an HTTP server

// Serve static files from the "public" directory
app.use(express.static("public"));

// Middleware for parsing request bodies
app.use(express.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Define routes
app.use("/api/card-scheme", cardDetails); // Use the cardDetails routes for the /api/card-scheme endpoint

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found"); // Create a new error with a "Not Found" message
  err.status = 404; // Set the status code to 404
  next(err); // Forward the error to the error handler
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.message, err); // Log the error message and the error object
  res.locals.message = err.message; // Set the local response message to the error message
  res.locals.error = err; // set the local response error to the error object
  res.status(err.status || 500); // Set the response status code to the error status code or 500 if not specified
  res.json({
    message: err.message, // Send the error message as part of the response
    error: err, // Send the error object
  });
});

// Set the port number
const port = 3001;
httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`); // Log a message when the server starts
});

module.exports = { app, httpServer }; // Export the app and httpServer objects
