const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// GET /api/audit — full audit log (HR/admin/superintendent/HOD can see all)
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT al.*, pe.oc_number, pe.dept_section, pe.machine_id, pe.worker_name
       FROM audit_log al
       JOIN production_entries pe ON pe.id = al.entry_id
       ORDER BY al.created_at DESC
       LIMIT 500`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/audit/:entry_id — audit trail for a single entry
router.get('/:entry_id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM audit_log
       WHERE entry_id = ?
       ORDER BY created_at ASC`,
      [req.params.entry_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;