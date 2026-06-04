const express = require("express");
const router = express.Router();

const db = require("../db");
const verifyToken = require("../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {

    const [rows] = await db.query(
      "SELECT * FROM workers"
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;