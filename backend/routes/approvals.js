const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/auth');
const { logAction, notifyNextApprover, notifyShiftIncharge } = require('../auditHelper');

const router = express.Router();

// ─── Helper: get entry (for audit from_status + shift_incharge_id) ──────────
async function getEntry(id) {
  const [[entry]] = await db.query(
    'SELECT id, status, oc_number, shift_incharge_id FROM production_entries WHERE id = ?',
    [id]
  );
  return entry;
}

// ========================
// HOD APPROVAL
// ========================
router.put('/hod/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'hod')
    return res.status(403).json({ error: 'Forbidden' });

  const { action, remarks, production_quantity } = req.body;
  const newStatus = action === 'approve' ? 'pending_superintendent' : 'rejected';

  try {
    const entry = await getEntry(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.status !== 'pending_hod')
      return res.status(409).json({ error: `Entry is not pending HOD approval (current status: ${entry.status})` });

    if (action === 'approve') {
      await db.query(
        `UPDATE production_entries
         SET status=?, hod_remarks=?, production_quantity=?, approved_by=?, approved_at=NOW()
         WHERE id=?`,
        [newStatus, remarks, production_quantity, req.user.email, req.params.id]
      );
      await notifyNextApprover(entry.id, newStatus, entry.oc_number, req.user.name);
    } else {
      await db.query(
        `UPDATE production_entries
         SET status=?, hod_remarks=?, production_quantity=?, rejected_by=?, rejected_at=NOW()
         WHERE id=?`,
        [newStatus, remarks, production_quantity, req.user.email, req.params.id]
      );
      await notifyShiftIncharge(entry.id, entry.shift_incharge_id, entry.oc_number, req.user.name, 'HOD');
    }

    await logAction({
      entry_id:   entry.id,
      actor_id:   req.user.id,
      actor_name: req.user.name,
      actor_role: 'hod',
      action:     action === 'approve' ? 'approved' : 'rejected',
      from_status: entry.status,
      to_status:   newStatus,
      remarks,
    });

    res.json({ message: `Entry ${action}d by HOD` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// SUPERINTENDENT APPROVAL
// ========================
router.put('/superintendent/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'superintendent')
    return res.status(403).json({ error: 'Forbidden' });

  const { action, remarks, production_quantity } = req.body;
  const newStatus = action === 'approve' ? 'pending_hr' : 'rejected';

  try {
    const entry = await getEntry(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.status !== 'pending_superintendent')
      return res.status(409).json({ error: `Entry is not pending Superintendent approval (current status: ${entry.status})` });

    if (action === 'approve') {
      await db.query(
        `UPDATE production_entries
         SET status=?, superintendent_remarks=?, production_quantity=?, approved_by=?, approved_at=NOW()
         WHERE id=?`,
        [newStatus, remarks, production_quantity, req.user.email, req.params.id]
      );
      await notifyNextApprover(entry.id, newStatus, entry.oc_number, req.user.name);
    } else {
      await db.query(
        `UPDATE production_entries
         SET status=?, superintendent_remarks=?, production_quantity=?, rejected_by=?, rejected_at=NOW()
         WHERE id=?`,
        [newStatus, remarks, production_quantity, req.user.email, req.params.id]
      );
      await notifyShiftIncharge(entry.id, entry.shift_incharge_id, entry.oc_number, req.user.name, 'Superintendent');
    }

    await logAction({
      entry_id:   entry.id,
      actor_id:   req.user.id,
      actor_name: req.user.name,
      actor_role: 'superintendent',
      action:     action === 'approve' ? 'approved' : 'rejected',
      from_status: entry.status,
      to_status:   newStatus,
      remarks,
    });

    res.json({ message: `Entry ${action}d by Superintendent` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// HR FINAL APPROVAL
// ========================
router.put('/hr/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'hr')
    return res.status(403).json({ error: 'Forbidden' });

  const { action, remarks, incentive_amount } = req.body;
  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  try {
    const entry = await getEntry(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.status !== 'pending_hr')
      return res.status(409).json({ error: `Entry is not pending HR approval (current status: ${entry.status})` });

    if (action === 'approve') {
      await db.query(
        `UPDATE production_entries
         SET status=?, hr_remarks=?, incentive_amount=?, approved_by=?, approved_at=NOW()
         WHERE id=?`,
        [newStatus, remarks, incentive_amount, req.user.email, req.params.id]
      );
    } else {
      await db.query(
        `UPDATE production_entries
         SET status=?, hr_remarks=?, incentive_amount=?, rejected_by=?, rejected_at=NOW()
         WHERE id=?`,
        [newStatus, remarks, incentive_amount, req.user.email, req.params.id]
      );
    }

    // Always notify shift incharge of final outcome
    const finalMsg = action === 'approve'
      ? `Your entry OC #${entry.oc_number} has been APPROVED and incentive released by HR`
      : `Your entry OC #${entry.oc_number} was rejected by HR`;
    await db.query(
      'INSERT INTO notifications (recipient_id, entry_id, message) VALUES (?, ?, ?)',
      [entry.shift_incharge_id, entry.id, finalMsg]
    );

    await logAction({
      entry_id:   entry.id,
      actor_id:   req.user.id,
      actor_name: req.user.name,
      actor_role: 'hr',
      action:     action === 'approve' ? 'approved' : 'rejected',
      from_status: entry.status,
      to_status:   newStatus,
      remarks,
    });

    res.json({ message: `Entry ${action}d by HR` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;