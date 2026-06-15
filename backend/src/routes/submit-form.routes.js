const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const pool = require("../../config/db");
const validateContact = require("../middleware/validate-contact");

// Throttle submissions to deter spam/abuse: max 5 per 15 minutes per IP.
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many submissions. Please try again later." },
});

router.post("/submit-form", submitLimiter, validateContact, async (req, res) => {
  const { name, email, company, phone, message, website } = req.body;

  // Honeypot: bots fill the hidden "website" field. Pretend success and drop it.
  if (website) {
    return res.status(200).json({ message: "Form submitted successfully!" });
  }

  try {
    const sql =
      "INSERT INTO contact_form (name, email, company, phone, message) VALUES (?, ?, ?, ?, ?)";
    await pool.query(sql, [name, email, company || null, phone || null, message]);
    res.status(200).json({ message: "Form submitted successfully!" });
  } catch (err) {
    console.error("Error submitting form:", err);
    res.status(500).json({ message: "Failed to submit form" });
  }
});

module.exports = router;
