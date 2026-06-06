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

    const [users] = await db.query(
      `SELECT
       id,
       name,
       email,
       role,
       created_at
       FROM users`
    );

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

module.exports = router;