const express = require("express");
const router = express.Router();

const db = require("../db");
const verifyToken = require("../middleware/auth");

// GET ALL WORKERS
router.get("/", verifyToken, async (req, res) => {
  try {

    const [rows] = await db.query(
      "SELECT * FROM workers"
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// ADD WORKER
router.post("/", verifyToken, async (req, res) => {

  const { name, code } = req.body;

  try {

    await db.query(
      `
      INSERT INTO workers
      (name, code)
      VALUES (?, ?)
      `,
      [name, code]
    );

    res.json({
      message: "Worker Added Successfully"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});

// DELETE WORKER
router.delete("/:id", verifyToken, async (req, res) => {

  try {

    await db.query(
      `
      DELETE FROM workers
      WHERE id = ?
      `,
      [req.params.id]
    );

    res.json({
      message: "Worker Deleted Successfully"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});
// UPDATE WORKER
router.put("/:id", verifyToken, async (req, res) => {

  const { name, code } = req.body;

  try {

    await db.query(
      `
      UPDATE workers
      SET
        name = ?,
        code = ?
      WHERE id = ?
      `,
      [name, code, req.params.id]
    );

    res.json({
      message: "Worker Updated Successfully"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

module.exports = router;