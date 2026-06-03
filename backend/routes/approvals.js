const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/auth');

const router = express.Router();


// HOD APPROVAL
router.put('/hod/:id', verifyToken, async (req, res) => {

  if (req.user.role !== 'hod') {
    return res.status(403).json({
      error: 'Forbidden'
    });
  }

  const {
    action,
    remarks,
    production_quantity
  } = req.body;

  const newStatus =
    action === 'approve'
      ? 'pending_superintendent'
      : 'rejected';

  try {

    await db.query(
      `UPDATE production_entries
       SET
         status = ?,
         hod_remarks = ?,
         production_quantity = ?
       WHERE id = ?`,
      [
        newStatus,
        remarks,
        production_quantity,
        req.params.id
      ]
    );

    res.json({
      message: `Entry ${action}d by HOD`
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});
// SUPERINTENDENT APPROVAL
router.put('/superintendent/:id', verifyToken, async (req, res) => {

  if (req.user.role !== 'superintendent') {
    return res.status(403).json({
      error: 'Forbidden'
    });
  }

  const {
    action,
    remarks,
    production_quantity
  } = req.body;

  const newStatus =
    action === 'approve'
      ? 'pending_hr'
      : 'rejected';

  try {

    await db.query(
      `UPDATE production_entries
       SET
         status = ?,
         superintendent_remarks = ?,
         production_quantity = ?
       WHERE id = ?`,
      [
        newStatus,
        remarks,
        production_quantity,
        req.params.id
      ]
    );

    res.json({
      message: `Entry ${action}d by Superintendent`
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

// HR FINAL APPROVAL
router.put('/hr/:id', verifyToken, async (req, res) => {

  if (req.user.role !== 'hr') {
    return res.status(403).json({
      error: 'Forbidden'
    });
  }

  const {
    action,
    remarks,
    incentive_amount
  } = req.body;

  const newStatus =
    action === 'approve'
      ? 'approved'
      : 'rejected';

  try {

    await db.query(
      `UPDATE production_entries
       SET
         status = ?,
         hr_remarks = ?,
         incentive_amount = ?
       WHERE id = ?`,
      [
        newStatus,
        remarks,
        incentive_amount,
        req.params.id
      ]
    );

    res.json({
      message: `Entry ${action}d by HR`
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

module.exports = router;