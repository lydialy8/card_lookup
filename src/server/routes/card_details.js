var express = require("express");
var router = express.Router();
const axios = require("axios");
const { Pool } = require("pg");

const connProperties = {
  connectionString:
    "postgres://cards_usr:P@ssw0rd@cards_lookup_db:5432/postgres",
};
const pool = new Pool(connProperties);

async function getCount(start, limit) {
  const res = await pool.query(
    `SELECT card_number, COUNT(*) as count FROM (SELECT * FROM cards.card_details ORDER BY query_time DESC) x GROUP BY 1  LIMIT ${limit} OFFSET ${start}`
  );
  return res;
}

async function getDetails(cardNumber) {
  const res = await pool.query(
    `SELECT * FROM cards.card_details WHERE card_number = '${cardNumber}' ORDER BY query_time DESC LIMIT 1`
  );
  return res;
}

router.get("/verify/:cardNumber", async function (req, res, next) {
  try {
    let details = await getDetails(req.params.cardNumber);
    let scheme, type, bank, err;
    if (details.rowCount === 0) {
      await axios
        .get(`https://lookup.binlist.net/${req.params.cardNumber}`)
        .then((response) => {
          scheme = response.data.scheme;
          type = response.data.type;
          bank = response.data.bank;
        })
        .catch((error) => {
          console.error("Error: " + error.message);
          res.status(404).json({
            success: false,
            payload: "Card not found",
          });
          err = error;
        });
    } else {
      scheme = details.rows[0].scheme;
      type = details.rows[0].type;
      bank = details.rows[0].bank;
    }
    if (!err) {
      res.json({
        success: true,
        payload: {
          scheme: scheme,
          type: type,
          bank: bank,
        },
      });

      await pool.query(
        "INSERT INTO cards.card_details (card_number, scheme, type, bank) VALUES ($1, $2, $3, $4)",
        [req.params.cardNumber, scheme, type, bank]
      );
    }
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({
      success: false,
      payload: "Internal Server Error",
    });
  }
});

router.get("/stats/:start/:limit", async function (req, res, next) {
  const start = parseInt(req.params.start) || 0;
  const limit = parseInt(req.params.limit) || 10;
  let payload = await getCount(start, limit);

  const response = {
    success: true,
    start: start,
    limit: limit,
    size: Buffer.byteLength(JSON.stringify(payload)),
    payload: payload.rows.reduce((acc, row) => {
      acc[row.card_number] = row.count;
      return acc;
    }, {}),
  };

  res.json(response);
});

module.exports = router;
