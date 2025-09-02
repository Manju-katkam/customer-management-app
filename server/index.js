import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database("./customers.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// Create table if not exists
db.run(
  `CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      address TEXT,
      phone TEXT
  )`
);

// GET all customers
app.get("/customers", (req, res) => {
  db.all("SELECT * FROM customers", [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST add a new customer
app.post("/customers", (req, res) => {
  const { name, address, phone } = req.body;

  if (!name || !address || !phone) {
    res.status(400).json({ error: "Please provide name, address, and phone" });
    return;
  }

  db.run(
    `INSERT INTO customers (name, address, phone) VALUES (?, ?, ?)`,
    [name, address, phone],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, address, phone });
    }
  );
});

// PUT update customer
app.put("/customers/:id", (req, res) => {
  const { name, address, phone } = req.body;
  const { id } = req.params;

  db.run(
    `UPDATE customers SET name = ?, address = ?, phone = ? WHERE id = ?`,
    [name, address, phone, id],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ updatedID: id });
    }
  );
});

// DELETE customer
app.delete("/customers/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM customers WHERE id = ?`, id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ deletedID: id });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
