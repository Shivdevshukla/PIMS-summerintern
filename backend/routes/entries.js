const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/auth');
const { logAction, notifyNextApprover } = require('../auditHelper');

const router = express.Router();

// CREATE ENTRY
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'shift_incharge')
    return res.status(403).json({ error: 'Only Shift Incharge can create entries' });

  const {
    worker_name, machine_id, dept_section,
    oc_stage, oc_type, oc_number,
    production_quantity, raw_material_used,
    working_hours, shift_date, shift,
    remarks, incentive_amount
  } = req.body;

  const missing = [];
  if (!worker_name)        missing.push('worker_name');
  if (!machine_id)         missing.push('machine_id');
  if (!dept_section)       missing.push('dept_section');
  if (!oc_stage)           missing.push('oc_stage');
  if (!oc_type)            missing.push('oc_type');
  if (!oc_number)          missing.push('oc_number');
  if (!shift_date)         missing.push('shift_date');
  if (!shift)              missing.push('shift');
  if (!production_quantity || Number(production_quantity) <= 0) missing.push('production_quantity');
  if (!working_hours || Number(working_hours) <= 0) missing.push('working_hours');

  if (missing.length > 0)
    return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });

  try {
    const [result] = await db.query(
      `INSERT INTO production_entries
        (shift_incharge_id, submitted_by_name, worker_name, machine_id, dept_section,
         oc_stage, oc_type, oc_number, production_quantity, raw_material_used,
         working_hours, shift_date, shift, remarks, incentive_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, req.user.name, worker_name, machine_id, dept_section,
        oc_stage, oc_type, oc_number,
        Number(production_quantity), Number(raw_material_used) || 0,
        Number(working_hours), shift_date, shift,
        remarks || '', Number(incentive_amount) || 0,
        'pending_hod'
      ]
    );

    const entryId = result.insertId;

    // Audit: submitted
    await logAction({
      entry_id:   entryId,
      actor_id:   req.user.id,
      actor_name: req.user.name,
      actor_role: 'shift_incharge',
      action:     'submitted',
      from_status: '',
      to_status:   'pending_hod',
      remarks:     remarks || null,
    });

    // Notify HOD
    await notifyNextApprover(entryId, 'pending_hod', oc_number, req.user.name);

    res.status(201).json({ success: true, message: 'Entry submitted for HOD approval' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET ALL ENTRIES — filtered by role on the backend
router.get('/', verifyToken, async (req, res) => {
  const { role, id } = req.user;

  // Map each approver role to the exact status they should see
  const ROLE_STATUS = {
    hod:            'pending_hod',
    superintendent: 'pending_superintendent',
    hr:             'pending_hr',
  };

  let query = 'SELECT * FROM production_entries';
  const args = [];

  if (role === 'shift_incharge') {
    // Shift incharge sees only their own submissions (all statuses)
    query += ' WHERE shift_incharge_id = ?';
    args.push(id);
  } else if (ROLE_STATUS[role]) {
    // HOD / Superintendent / HR each see only entries awaiting their action
    query += ' WHERE status = ?';
    args.push(ROLE_STATUS[role]);
  }
  // admin and any other roles get everything (no WHERE clause)

  query += ' ORDER BY created_at DESC';

  try {
    const [rows] = await db.query(query, args);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ENTRY BY ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM production_entries WHERE id = ?', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Entry not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;