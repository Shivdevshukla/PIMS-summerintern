const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/auth');
const { logAction, notifyNextApprover } = require('../auditHelper');

const router = express.Router();

// ─── Helper: find an existing ACTIVE (non-rejected) entry with the same
//     OC Number + Shift Date + Shift ──────────────────────────────────────
async function findDuplicateOC(oc_number, shift_date, shift, excludeId = null) {
  let query = `
    SELECT id, status, submitted_by_name, created_at
    FROM production_entries
    WHERE oc_number = ? AND shift_date = ? AND shift = ? AND status != 'rejected'
  `;
  const params = [oc_number, shift_date, shift];

  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  const [rows] = await db.query(query, params);
  return rows[0] || null;
}

// Friendly message builder
function duplicateMessage(oc_number, shift, shift_date, duplicate) {
  const formattedDate = new Date(shift_date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const statusLabel = duplicate.status.replace(/_/g, ' ');
  return `OC #${oc_number} is already logged for Shift ${shift} on ${formattedDate} `
       + `(status: ${statusLabel}, submitted by ${duplicate.submitted_by_name}). `
       + `Please verify before re-entering this entry.`;
}

// ========================
// CHECK OC NUMBER (live validation while typing)
// GET /api/entries/check-oc?oc_number=1256&shift_date=2026-06-15&shift=A
// ⚠️ Must be declared BEFORE GET /:id, otherwise Express treats
//    "check-oc" as an :id param.
// ========================
router.get('/check-oc', verifyToken, async (req, res) => {
  const { oc_number, shift_date, shift } = req.query;

  if (!oc_number || !shift_date || !shift) {
    return res.json({ duplicate: false }); // not enough info yet — don't block typing
  }

  try {
    const duplicate = await findDuplicateOC(oc_number.trim(), shift_date, shift);

    if (duplicate) {
      return res.json({
        duplicate: true,
        message: duplicateMessage(oc_number.trim(), shift, shift_date, duplicate),
        entry: duplicate,
      });
    }

    res.json({ duplicate: false });
  } catch (err) {
    console.error('OC check error:', err);
    res.status(500).json({ error: err.message });
  }
});

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

  const trimmedOcNumber = oc_number.trim();

  try {
    // ── Duplicate check (before insert) ──
    const duplicate = await findDuplicateOC(trimmedOcNumber, shift_date, shift);
    if (duplicate) {
      return res.status(409).json({
        error: duplicateMessage(trimmedOcNumber, shift, shift_date, duplicate),
      });
    }

    const [result] = await db.query(
      `INSERT INTO production_entries
        (shift_incharge_id, submitted_by_name, worker_name, machine_id, dept_section,
         oc_stage, oc_type, oc_number, production_quantity, raw_material_used,
         working_hours, shift_date, shift, remarks, incentive_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, req.user.name, worker_name, machine_id, dept_section,
        oc_stage, oc_type, trimmedOcNumber,
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
    await notifyNextApprover(entryId, 'pending_hod', trimmedOcNumber, req.user.name);

    res.status(201).json({ success: true, message: 'Entry submitted for HOD approval' });
  } catch (err) {
    // Safety net: DB-level unique constraint (race condition between
    // the pre-check above and the insert — e.g. two Shift Incharges
    // submitting the same OC at the exact same moment)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: `OC #${trimmedOcNumber} is already logged for Shift ${shift} on this date. `
             + `Please refresh and verify before re-entering this entry.`,
      });
    }

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

// ========================
// RESUBMIT A REJECTED ENTRY
// PUT /api/entries/:id/resubmit
// Shift Incharge edits a rejected entry and pushes it back to pending_hod.
// Clears all approval/rejection trail fields so it goes through the
// full workflow again (HOD -> Superintendent -> HR).
// ========================
router.put('/:id/resubmit', verifyToken, async (req, res) => {
  if (req.user.role !== 'shift_incharge')
    return res.status(403).json({ error: 'Only Shift Incharge can resubmit entries' });

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

  const trimmedOcNumber = oc_number.trim();

  try {
    const [[entry]] = await db.query(
      'SELECT id, status, shift_incharge_id, oc_number FROM production_entries WHERE id = ?',
      [req.params.id]
    );

    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.shift_incharge_id !== req.user.id)
      return res.status(403).json({ error: 'You can only resubmit your own entries' });
    if (entry.status !== 'rejected')
      return res.status(409).json({ error: `Only rejected entries can be resubmitted (current status: ${entry.status})` });

    const duplicate = await findDuplicateOC(trimmedOcNumber, shift_date, shift, entry.id);
    if (duplicate) {
      return res.status(409).json({
        error: duplicateMessage(trimmedOcNumber, shift, shift_date, duplicate),
      });
    }

    await db.query(
      `UPDATE production_entries
       SET worker_name=?, machine_id=?, dept_section=?,
           oc_stage=?, oc_type=?, oc_number=?,
           production_quantity=?, raw_material_used=?,
           working_hours=?, shift_date=?, shift=?,
           remarks=?, incentive_amount=?,
           status='pending_hod',
           hod_remarks=NULL, superintendent_remarks=NULL, hr_remarks=NULL,
           rejected_by=NULL, rejected_at=NULL,
           approved_by=NULL, approved_at=NULL
       WHERE id=?`,
      [
        worker_name, machine_id, dept_section,
        oc_stage, oc_type, trimmedOcNumber,
        Number(production_quantity), Number(raw_material_used) || 0,
        Number(working_hours), shift_date, shift,
        remarks || '', Number(incentive_amount) || 0,
        req.params.id
      ]
    );

    await logAction({
      entry_id:   entry.id,
      actor_id:   req.user.id,
      actor_name: req.user.name,
      actor_role: 'shift_incharge',
      action:     'resubmitted',
      from_status: 'rejected',
      to_status:   'pending_hod',
      remarks:     remarks || null,
    });

    await notifyNextApprover(entry.id, 'pending_hod', trimmedOcNumber, req.user.name);

    res.json({ success: true, message: 'Entry updated and resubmitted for HOD approval' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: `OC #${trimmedOcNumber} is already logged for Shift ${shift} on this date. `
             + `Please refresh and verify before re-entering this entry.`,
      });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;