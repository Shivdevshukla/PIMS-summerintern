const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

// GET ALL WORKERS (with optional search)
router.get("/", verifyToken, async (req, res) => {
  const { search } = req.query;
  try {
    let rows;
    if (search) {
      [rows] = await db.query(
        "SELECT * FROM workers WHERE active=1 AND (name LIKE ? OR code LIKE ?) ORDER BY name",
        [`%${search}%`, `%${search}%`]
      );
    } else {
      [rows] = await db.query(
        "SELECT * FROM workers WHERE active=1 ORDER BY name"
      );
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD WORKER
router.post("/", verifyToken, async (req, res) => {
  const { name, code, department, designation } = req.body;
  if (!name || !code) return res.status(400).json({ error: "Name and code are required" });
  try {
    await db.query(
      "INSERT INTO workers (name, code, department, designation) VALUES (?, ?, ?, ?)",
      [name, code, department || "", designation || ""]
    );
    res.json({ message: "Worker Added Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE WORKER (soft delete)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await db.query("UPDATE workers SET active=0 WHERE id=?", [req.params.id]);
    res.json({ message: "Worker Removed Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE WORKER
router.put("/:id", verifyToken, async (req, res) => {
  const { name, code, department, designation } = req.body;
  try {
    await db.query(
      "UPDATE workers SET name=?, code=?, department=?, designation=? WHERE id=?",
      [name, code, department || "", designation || "", req.params.id]
    );
    res.json({ message: "Worker Updated Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;