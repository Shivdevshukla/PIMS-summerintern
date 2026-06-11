const db = require('../db');

// ─── Role → next approver role mapping ───────────────────────────────────────
const NEXT_ROLE = {
  pending_hod:            'hod',
  pending_superintendent: 'superintendent',
  pending_hr:             'hr',
};

/**
 * logAction — insert one row into audit_log
 */
async function logAction({ entry_id, actor_id, actor_name, actor_role, action, from_status, to_status, remarks }) {
  await db.query(
    `INSERT INTO audit_log
       (entry_id, actor_id, actor_name, actor_role, action, from_status, to_status, remarks)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [entry_id, actor_id, actor_name, actor_role, action, from_status || '', to_status, remarks || null]
  );
}

/**
 * notifyNextApprover — find all users with the next role and create a notification for each.
 * @param {number} entry_id
 * @param {string} next_status   e.g. 'pending_superintendent'
 * @param {string} oc_number
 * @param {string} actor_name    who triggered the move
 */
async function notifyNextApprover(entry_id, next_status, oc_number, actor_name) {
  const role = NEXT_ROLE[next_status];
  if (!role) return; // 'approved' or 'rejected' — no next approver

  const [users] = await db.query(
    'SELECT id FROM users WHERE role = ?',
    [role]
  );

  if (!users.length) return;

  const message = `Entry OC #${oc_number} requires your approval (forwarded by ${actor_name})`;

  const values = users.map(u => [u.id, entry_id, message]);
  await db.query(
    'INSERT INTO notifications (recipient_id, entry_id, message) VALUES ?',
    [values]
  );
}

/**
 * notifyShiftIncharge — notify the original submitter of a rejection.
 */
async function notifyShiftIncharge(entry_id, shift_incharge_id, oc_number, actor_name, actor_role) {
  const message = `Your entry OC #${oc_number} was rejected by ${actor_name} (${actor_role})`;
  await db.query(
    'INSERT INTO notifications (recipient_id, entry_id, message) VALUES (?, ?, ?)',
    [shift_incharge_id, entry_id, message]
  );
}

module.exports = { logAction, notifyNextApprover, notifyShiftIncharge };