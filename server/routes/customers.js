const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./server/database.db");

// Create customers table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT NOT NULL
  )
`);

// ➤ Get all customers
router.get("/", (req, res) => {
  db.all("SELECT * FROM customers", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ➤ Get a single customer by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM customers WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Customer not found" });
    res.json(row);
  });
});

// ➤ Add a new customer
router.post("/", (req, res) => {
  const { first_name, last_name, phone_number } = req.body;
  if (!first_name || !last_name || !phone_number) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)`;
  db.run(query, [first_name, last_name, phone_number], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, first_name, last_name, phone_number });
  });
});

// ➤ Update a customer
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, phone_number } = req.body;

  const query = `UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?`;
  db.run(query, [first_name, last_name, phone_number, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer updated successfully" });
  });
});

// ➤ Delete a customer
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM customers WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer deleted successfully" });
  });
});

module.exports = router;
