const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads", "profiles");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `user_${req.user.id}_${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// Only allow image files, max 2MB
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG, or WEBP images are allowed"));
  },
});

// UPLOAD / UPDATE profile photo
router.post("/upload", verifyToken, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const [rows] = await db.query("SELECT profile_photo FROM users WHERE id=?", [req.user.id]);
    const oldPhoto = rows[0]?.profile_photo;

    const photoUrl = `/uploads/profiles/${req.file.filename}`;

    await db.query("UPDATE users SET profile_photo=? WHERE id=?", [photoUrl, req.user.id]);

    if (oldPhoto) {
      const oldPath = path.join(__dirname, "..", oldPhoto);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    res.json({ message: "Profile photo updated", profile_photo: photoUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REMOVE profile photo
router.delete("/remove", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT profile_photo FROM users WHERE id=?", [req.user.id]);
    const oldPhoto = rows[0]?.profile_photo;

    await db.query("UPDATE users SET profile_photo=NULL WHERE id=?", [req.user.id]);

    if (oldPhoto) {
      const oldPath = path.join(__dirname, "..", oldPhoto);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    res.json({ message: "Profile photo removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET current user's profile (with photo)
router.get("/me", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, profile_photo FROM users WHERE id=?",
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;