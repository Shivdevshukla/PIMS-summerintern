const express = require("express");
const router = express.Router();

const db = require("../db");
const verifyToken = require("../middleware/auth");

// Dashboard Stats — filtered by current user for shift_incharge, global for others
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const isIncharge = req.user.role === "shift_incharge";
    const whereClause = isIncharge
      ? "WHERE shift_incharge_id = ?"
      : "";
    const args = isIncharge ? [req.user.id] : [];

    const [[total]] = await db.query(
      `SELECT COUNT(*) AS count FROM production_entries ${whereClause}`,
      args
    );

    const [[pendingHod]] = await db.query(
      `SELECT COUNT(*) AS count FROM production_entries ${whereClause ? whereClause + " AND status='pending_hod'" : "WHERE status='pending_hod'"}`,
      args
    );

    const [[pendingSuperintendent]] = await db.query(
      `SELECT COUNT(*) AS count FROM production_entries ${whereClause ? whereClause + " AND status='pending_superintendent'" : "WHERE status='pending_superintendent'"}`,
      args
    );

    const [[pendingHr]] = await db.query(
      `SELECT COUNT(*) AS count FROM production_entries ${whereClause ? whereClause + " AND status='pending_hr'" : "WHERE status='pending_hr'"}`,
      args
    );

    const [[approved]] = await db.query(
      `SELECT COUNT(*) AS count FROM production_entries ${whereClause ? whereClause + " AND status='approved'" : "WHERE status='approved'"}`,
      args
    );

    const [[incentive]] = await db.query(
      `SELECT COALESCE(SUM(incentive_amount), 0) AS total FROM production_entries ${whereClause}`,
      args
    );

    res.json({
      totalEntries: total.count,
      pendingHod: pendingHod.count,
      pendingSuperintendent: pendingSuperintendent.count,
      pendingHr: pendingHr.count,
      approved: approved.count,
      totalIncentive: incentive.total,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Recent Entries — filtered by current user for shift_incharge
router.get("/recent", verifyToken, async (req, res) => {
  try {
    const { from, to } = req.query;
    const isIncharge = req.user.role === "shift_incharge";
    const params = [];
    let conditions = [];

    if (isIncharge) {
      conditions.push("shift_incharge_id = ?");
      params.push(req.user.id);
    }

    if (from && to) {
      conditions.push("DATE(created_at) BETWEEN ? AND ?");
      params.push(from, to);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT * FROM production_entries
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Dashboard recent error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;