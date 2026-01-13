const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';

const users = {};

app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'missing' });
  if (users[username]) return res.status(400).json({ error: 'exists' });
  const hash = await bcrypt.hash(password, 10);
  users[username] = { username, passwordHash: hash, id: username };
  res.json({ ok: true });
});

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const u = users[username];
  if (!u) return res.status(401).json({ error: 'invalid' });
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid' });
  const token = jwt.sign({ sub: u.id, username }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

app.listen(PORT, () => console.log(`auth-service listening ${PORT}`));
