app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if user exists and if password is correct
  db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) {
      res.status(500).send('Internal server error');
    } else if (results.length === 0) {
      res.status(401).send('Invalid username or password');
    } else {
      // Create and return JWT
      const token = jwt.sign({ id: results[0].id }, process.env.JWT_SECRET);
      res.json({ token });
    }
  });
});
