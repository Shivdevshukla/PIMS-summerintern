const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const verifyToken = require('../middleware/auth');

const router = express.Router();


// GET ALL USERS
router.get('/', verifyToken, async (req, res) => {

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin Access Only'
    });
  }

  try {

    const [users] = await db.query(`
      SELECT
      id,
      name,
      email,
      role,
      created_at
      FROM users
    `);

    res.json(users);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// ADD USER
router.post('/', verifyToken, async (req, res) => {

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin Access Only'
    });
  }

  const {
    name,
    email,
    password,
    role
  } = req.body;

  try {

    const hashedPassword =
      await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users
      (name,email,password,role)
      VALUES (?,?,?,?)`,
      [
        name,
        email,
        hashedPassword,
        role
      ]
    );

    res.json({
      message: 'User Added Successfully'
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// CHANGE OWN PASSWORD
router.put('/change-password', verifyToken, async (req, res) => {

  const { currentPassword, newPassword } = req.body;

  try {

    const [rows] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: 'User Not Found'
      });
    }

    const user = rows[0];

    const match = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!match) {
      return res.status(400).json({
        error: 'Current Password Incorrect'
      });
    }

    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE users
       SET password = ?
       WHERE id = ?`,
      [
        hashedPassword,
        req.user.id
      ]
    );

    res.json({
      message: 'Password Changed Successfully'
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// RESET USER PASSWORD (ADMIN ONLY)
router.put('/:id/reset-password', verifyToken, async (req, res) => {

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin Access Only'
    });
  }

  const { password } = req.body;

  try {

    const hashedPassword =
      await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE users
       SET password = ?
       WHERE id = ?`,
      [
        hashedPassword,
        req.params.id
      ]
    );

    res.json({
      message: 'Password Reset Successfully'
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// UPDATE USER ROLE
router.put('/:id', verifyToken, async (req, res) => {

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin Access Only'
    });
  }

  const { role } = req.body;

  try {

    await db.query(
      `UPDATE users
       SET role = ?
       WHERE id = ?`,
      [
        role,
        req.params.id
      ]
    );

    res.json({
      message: 'Role Updated Successfully'
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// DELETE USER
router.delete('/:id', verifyToken, async (req, res) => {

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin Access Only'
    });
  }

  try {

    await db.query(
      `DELETE FROM users
       WHERE id = ?`,
      [req.params.id]
    );

    res.json({
      message: 'User Deleted Successfully'
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// ── WORKER LINKING ───────────────────────────────────────────────────────────

// GET /api/users/unlinked-workers
// Returns workers that don't have a user_id linked yet
router.get('/unlinked-workers', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Admin Access Only' });

  try {
    const [rows] = await db.query(
      `SELECT id, name, code, department, designation
       FROM workers
       WHERE active = 1 AND (user_id IS NULL)
       ORDER BY name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/worker-users
// Returns users with role=worker and their linked worker info
router.get('/worker-users', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Admin Access Only' });

  try {
    const [rows] = await db.query(
      `SELECT
         u.id AS user_id, u.name AS user_name, u.email, u.created_at,
         w.id AS worker_id, w.name AS worker_name, w.code, w.department, w.designation
       FROM users u
       LEFT JOIN workers w ON w.user_id = u.id AND w.active = 1
       WHERE u.role = 'worker'
       ORDER BY u.name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/link-worker
// Links a users.id (worker role) to a workers.id row
router.post('/link-worker', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Admin Access Only' });

  const { user_id, worker_id } = req.body;
  if (!user_id || !worker_id)
    return res.status(400).json({ error: 'user_id and worker_id are required' });

  try {
    // Make sure this worker isn't already linked to someone else
    const [[existing]] = await db.query(
      'SELECT user_id FROM workers WHERE id = ?', [worker_id]
    );
    if (!existing)
      return res.status(404).json({ error: 'Worker not found' });
    if (existing.user_id && existing.user_id !== Number(user_id))
      return res.status(409).json({ error: 'This worker is already linked to another account' });

    // Unlink any previous worker linked to this user_id
    await db.query(
      'UPDATE workers SET user_id = NULL WHERE user_id = ?', [user_id]
    );

    // Link
    await db.query(
      'UPDATE workers SET user_id = ? WHERE id = ?', [user_id, worker_id]
    );

    res.json({ message: 'Worker linked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/link-worker/:user_id
// Removes the link between a worker login and their workers row
router.delete('/link-worker/:user_id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Admin Access Only' });

  try {
    await db.query(
      'UPDATE workers SET user_id = NULL WHERE user_id = ?',
      [req.params.user_id]
    );
    res.json({ message: 'Worker unlinked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;