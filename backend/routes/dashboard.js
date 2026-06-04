const express = require("express");
const router = express.Router();

const db = require("../db");
const verifyToken = require("../middleware/auth");

// Dashboard Stats
router.get("/stats", verifyToken, async (req, res) => {
  try {

    const [total] = await db.query(
      "SELECT COUNT(*) AS count FROM production_entries"
    );

    const [pending] = await db.query(
      "SELECT COUNT(*) AS count FROM production_entries WHERE status!='approved'"
    );

    const [approved] = await db.query(
      "SELECT COUNT(*) AS count FROM production_entries WHERE status='approved'"
    );

    const [incentive] = await db.query(
      "SELECT COALESCE(SUM(incentive_amount),0) AS total FROM production_entries"
    );

    res.json({
      totalEntries: total[0].count,
      pending: pending[0].count,
      approved: approved[0].count,
      totalIncentive: incentive[0].total,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// Recent Entries
router.get("/recent", verifyToken, async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT *
      FROM production_entries
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json(rows);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;