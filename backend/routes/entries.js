const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/auth');

const router = express.Router();


// CREATE ENTRY
router.post('/', verifyToken, async (req, res) => {

  // Only Shift Incharge can create entries
  if (req.user.role !== 'shift_incharge') {
    return res.status(403).json({
      error: 'Only Shift Incharge can create entries'
    });
  }

  const {
    worker_name,
    machine_id,
    dept_section,
    oc_stage,
    oc_type,
    oc_number,
    production_quantity,
    raw_material_used,
    working_hours,
    shift_date,
    shift,
    remarks,
    incentive_amount
  } = req.body;

  try {

    await db.query(
      `INSERT INTO production_entries (
        shift_incharge_id,
        submitted_by_name,
        worker_name,
        machine_id,
        dept_section,
        oc_stage,
        oc_type,
        oc_number,
        production_quantity,
        raw_material_used,
        working_hours,
        shift_date,
        shift,
        remarks,
        incentive_amount,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        req.user.name,
        worker_name,
        machine_id,
        dept_section,
        oc_stage,
        oc_type,
        oc_number,
        production_quantity,
        raw_material_used,
        working_hours,
        shift_date,
        shift,
        remarks,
        incentive_amount,
        'pending_hod'
      ]
    );

    res.json({
      message: 'Production Entry Submitted Successfully'
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// GET ALL ENTRIES
router.get('/', verifyToken, async (req, res) => {

  try {

    const [rows] = await db.query(
      'SELECT * FROM production_entries ORDER BY created_at DESC'
    );

    res.json(rows);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

module.exports = router;