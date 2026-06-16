// backend/routes/workerPortal.js
// All endpoints for the "worker" role self-service portal.
// Workers can only see entries where their name appears in worker_name.

const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// ── Guard: all routes require role=worker ────────────────────
function workerOnly(req, res, next) {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ error: 'Worker access only' });
  }
  next();
}

// ────────────────────────────────────────────────────────────
// GET /api/worker-portal/profile
// Returns the logged-in worker's own workers row (name, code,
// department, designation) matched via workers.user_id
// ────────────────────────────────────────────────────────────
router.get('/profile', verifyToken, workerOnly, async (req, res) => {
  try {
    const [[worker]] = await db.query(
      'SELECT id, name, code, department, designation FROM workers WHERE user_id = ? AND active = 1',
      [req.user.id]
    );

    if (!worker) {
      return res.status(404).json({
        error: 'Worker profile not found. Contact HR to link your account.',
      });
    }

    res.json(worker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/worker-portal/entries
// Returns APPROVED production entries where this worker's name
// appears in the worker_name field.
// Supports optional ?month=YYYY-MM filter.
// ────────────────────────────────────────────────────────────
router.get('/entries', verifyToken, workerOnly, async (req, res) => {
  try {
    // First resolve this user's worker name
    const [[worker]] = await db.query(
      'SELECT name FROM workers WHERE user_id = ? AND active = 1',
      [req.user.id]
    );

    if (!worker) {
      return res.status(404).json({
        error: 'Worker profile not linked. Contact HR.',
      });
    }

    const { month } = req.query; // e.g. "2026-06"

    let query = `
      SELECT
        id, oc_number, oc_stage, oc_type, machine_id, dept_section,
        shift, shift_date, working_hours,
        production_quantity, incentive_amount,
        worker_name, submitted_by_name, status, created_at,
        hod_remarks, superintendent_remarks, hr_remarks, approved_at
      FROM production_entries
      WHERE status = 'approved'
        AND FIND_IN_SET(?, REPLACE(worker_name, ', ', ','))
    `;
    const params = [worker.name];

    if (month) {
      query += ' AND DATE_FORMAT(shift_date, "%Y-%m") = ?';
      params.push(month);
    }

    query += ' ORDER BY shift_date DESC, created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/worker-portal/summary
// Monthly incentive totals for the last 12 months
// ────────────────────────────────────────────────────────────
router.get('/summary', verifyToken, workerOnly, async (req, res) => {
  try {
    const [[worker]] = await db.query(
      'SELECT name FROM workers WHERE user_id = ? AND active = 1',
      [req.user.id]
    );

    if (!worker) {
      return res.status(404).json({ error: 'Worker profile not linked.' });
    }

    // Monthly summary — last 12 months
    const [monthly] = await db.query(
  `SELECT
     DATE_FORMAT(shift_date, '%Y-%m')          AS month,
     DATE_FORMAT(MIN(shift_date), '%b %Y')     AS month_label,
     COUNT(*)                                  AS entry_count,
     SUM(incentive_amount)                     AS total_incentive,
     SUM(production_quantity)                  AS total_qty
   FROM production_entries
   WHERE status = 'approved'
     AND FIND_IN_SET(?, REPLACE(worker_name, ', ', ','))
     AND shift_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
   GROUP BY DATE_FORMAT(shift_date, '%Y-%m')
   ORDER BY month DESC`,
  [worker.name]
);

    // Lifetime totals
    const [[totals]] = await db.query(
      `SELECT
         COUNT(*)          AS total_entries,
         SUM(incentive_amount) AS total_incentive,
         SUM(production_quantity) AS total_qty,
         MAX(shift_date)   AS last_shift_date
       FROM production_entries
       WHERE status = 'approved'
         AND FIND_IN_SET(?, REPLACE(worker_name, ', ', ','))`,
      [worker.name]
    );

    res.json({ monthly, totals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;