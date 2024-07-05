const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

router.post("/submit-form", (req, res) => {
  const { name, email, company, phone, message } = req.body;

  pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection from pool:", err);
        return res.status(500).json({ message: "Failed to get database connection" });
      }

    const sql = "INSERT INTO contact_form (name, email, company, phone, message) VALUES (?, ?, ?, ?, ?)";
    connection.query(sql, [name, email, company, phone, message], (queryErr) => {
      connection.release();

      if (queryErr) {
        console.error("Error executing query:", queryErr);
        return res.status(500).json({ message: "Failed to submit form" });
      }

      res.status(200).json({ message: "Form submitted successfully!" });
    });
  });
});

module.exports = router;