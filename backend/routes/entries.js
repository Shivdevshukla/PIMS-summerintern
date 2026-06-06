const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();


// ===============================
// CREATE PRODUCTION ENTRY
// ===============================
router.post(
  '/',
  verifyToken,

  [
    body('worker_name')
      .notEmpty()
      .withMessage('Worker Name is required'),

    body('machine_id')
      .notEmpty()
      .withMessage('Machine ID is required'),

    body('dept_section')
      .notEmpty()
      .withMessage('Department Section is required'),

    body('oc_stage')
      .notEmpty()
      .withMessage('OC Stage is required'),

    body('oc_type')
      .notEmpty()
      .withMessage('OC Type is required'),

    body('oc_number')
      .notEmpty()
      .withMessage('OC Number is required'),

    body('production_quantity')
      .isNumeric()
      .withMessage('Production Quantity must be numeric')
      .custom(value => value > 0)
      .withMessage('Production Quantity must be greater than 0'),

    body('raw_material_used')
      .isNumeric()
      .withMessage('Raw Material Used must be numeric')
      .custom(value => value >= 0)
      .withMessage('Raw Material Used cannot be negative'),

    body('working_hours')
      .isNumeric()
      .withMessage('Working Hours must be numeric')
      .custom(value => value > 0)
      .withMessage('Working Hours must be greater than 0'),

    body('shift_date')
      .notEmpty()
      .withMessage('Shift Date is required'),

    body('shift')
      .isIn(['A', 'B', 'C'])
      .withMessage('Shift must be A, B, or C'),

    body('incentive_amount')
      .isNumeric()
      .withMessage('Incentive Amount must be numeric')
      .custom(value => value >= 0)
      .withMessage('Incentive Amount cannot be negative')
  ],

  async (req, res) => {

    try {

      // Only Shift Incharge can create entries
      if (req.user.role !== 'shift_incharge') {
        return res.status(403).json({
          success: false,
          error: 'Only Shift Incharge can create entries'
        });
      }

      // Validation Check
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
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
          remarks || '',
          incentive_amount,
          'pending_hod'
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Production Entry Submitted Successfully'
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success: false,
        error: err.message
      });

    }

  }
);


// ===============================
// GET ALL PRODUCTION ENTRIES
// ===============================
router.get('/', verifyToken, async (req, res) => {

  try {

    const [rows] = await db.query(
      `SELECT *
       FROM production_entries
       ORDER BY created_at DESC`
    );

    res.status(200).json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});


// ===============================
// GET ENTRY BY ID
// ===============================
router.get('/:id', verifyToken, async (req, res) => {

  try {

    const [rows] = await db.query(
      `SELECT *
       FROM production_entries
       WHERE id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found'
      });
    }

    res.json(rows[0]);

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});

module.exports = router;