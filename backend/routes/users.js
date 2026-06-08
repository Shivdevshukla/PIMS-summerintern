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

module.exports = router;