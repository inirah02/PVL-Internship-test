const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// MySQL Connection Pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydatabase'
});

// Body Parser Middleware
app.use(bodyParser.json());

// Authentication Middleware
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Login API Route
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }
  pool.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) throw err;
    if (results.length === 0 || results[0].password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const accessToken = jwt.sign({ username: username }, process.env.ACCESS_TOKEN_SECRET);
    return res.json({ accessToken: accessToken });
  });
});

// Register API Route
app
