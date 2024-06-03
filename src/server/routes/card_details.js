const express = require("express"); // Import the Express framework
const router = express.Router(); // Create a new router object
const axios = require("axios"); // Import axios for making HTTP requests
const config = require("../config"); // import the config
const { Pool } = require("pg"); // Import the pg module for PostgreSQL

// Use environment variables for sensitive information like database connection strings
const connProperties = {
  connectionString: config.psql_conn_str,
};
const pool = new Pool(connProperties); // Create a new PostgreSQL connection pool

// Function to get card count statistics from the database with parameterized queries
async function getCount(start, limit) {
  const res = await pool.query(
    `SELECT card_number, COUNT(*) as count 
     FROM (SELECT * FROM cards.card_details ORDER BY query_time DESC) x 
     GROUP BY card_number  
     LIMIT $1 OFFSET $2`,
    [limit, start] // Use parameterized queries to prevent SQL injection
  );
  return res;
}

// Function to get card details from the database with a parameterized query
async function getDetails(cardNumber) {
  const res = await pool.query(
    `SELECT * FROM cards.card_details WHERE card_number = $1 ORDER BY query_time DESC LIMIT 1`,
    [cardNumber] // Use parameterized queries to prevent SQL injection
  );
  return res;
}

// Route to verify card details
router.get("/verify/:cardNumber", async function (req, res, next) {
  const { cardNumber } = req.params; // Extract the card number from the request parameters

  try {
    const details = await getDetails(cardNumber); // Get card details from the database
    let scheme, type, bank;

    if (details.rowCount === 0) {
      // If the card details are not found in the database
      try {
        const response = await axios.get(
          `https://lookup.binlist.net/${cardNumber}`
        ); // Fetch card details from an external service
        ({ scheme, type, bank } = response.data); // Destructure the response data

        // Save fetched details to the database
        await pool.query(
          "INSERT INTO cards.card_details (card_number, scheme, type, bank) VALUES ($1, $2, $3, $4)",
          [cardNumber, scheme, type, bank]
        );
      } catch (error) {
        // Handle errors from the external service
        console.error(
          "Error fetching card details from external service:",
          error.message
        );
        return res.status(404).json({
          success: false,
          payload: "Card not found",
        });
      }
    } else {
      // If the card details are found in the database
      ({ scheme, type, bank } = details.rows[0]); // Destructure the database result
    }

    // Send the card details as the response
    res.json({
      success: true,
      payload: { scheme, type, bank },
    });
  } catch (err) {
    // Handle internal server errors
    console.error("Internal server error:", err.message);
    res.status(500).json({
      success: false,
      payload: "Internal Server Error",
    });
  }
});

// Route to get card statistics
router.get("/stats/:start/:limit", async function (req, res, next) {
  const start = parseInt(req.params.start) || 0; // Parse the start parameter or default to 0
  const limit = parseInt(req.params.limit) || 10; // Parse the limit parameter or default to 10

  try {
    const payload = await getCount(start, limit); // Get card count statistics from the database

    // Construct the response object
    const response = {
      success: true,
      start: start,
      limit: limit,
      size: Buffer.byteLength(JSON.stringify(payload)), // Calculate the size of the payload
      payload: payload.rows.reduce((acc, row) => {
        acc[row.card_number] = row.count; // Reduce the result rows into an object with card_number as keys and count as values
        return acc;
      }, {}),
    };

    // Send the statistics as the response
    res.json(response);
  } catch (err) {
    // Handle errors while retrieving statistics
    console.error("Error retrieving stats:", err.message);
    res.status(500).json({
      success: false,
      payload: "Internal Server Error",
    });
  }
});

module.exports = router; // Export the router object
