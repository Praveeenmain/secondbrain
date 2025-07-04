const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors());
app.use(express.json());

const mongoUrl = process.env.MONGODB_URL;
const dbName = 'secondbrain';
let db;

MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Middleware to verify JWT
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Auth: Signup
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  if (password.length < 8) return res.status(400).json({ error: 'Password too short' });
  const existing = await db.collection('users').findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const hashed = await bcrypt.hash(password, 10);
  const user = { name, email, password: hashed };
  await db.collection('users').insertOne(user);
  const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { name, email } });
});

// Auth: Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const user = await db.collection('users').findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { name: user.name, email: user.email } });
});

// Get all reflections for logged-in user
app.get('/api/reflections', auth, async (req, res) => {
  const reflections = await db.collection('reflections').find({ userEmail: req.user.email }).sort({ timestamp: -1 }).toArray();
  res.json(reflections);
});

// Add a new reflection (with mood)
app.post('/api/reflections', auth, async (req, res) => {
  const { content, categories, mood } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  const reflection = {
    userEmail: req.user.email,
    content,
    mood: mood || null,
    categories: categories || {},
    timestamp: new Date(),
  };
  const result = await db.collection('reflections').insertOne(reflection);
  res.status(201).json({ ...reflection, _id: result.insertedId });
});

// Delete a reflection by ID
app.delete('/api/reflections/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.collection('reflections').deleteOne({ _id: new ObjectId(id), userEmail: req.user.email });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Reflection not found or not authorized' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete reflection' });
  }
});

// (Updated) Chat endpoint: proxies to Groq API using user-provided API key
app.post('/api/chat', auth, async (req, res) => {
  const { message, groqApiKey, history } = req.body;
  if (!message || !groqApiKey) return res.status(400).json({ error: 'Message and Groq API key required' });
  try {
    // Fetch latest reflections for the user
    const reflections = await db.collection('reflections')
      .find({ userEmail: req.user.email })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    const systemPrompt = `You are a helpful AI assistant. The user has the following reflections: ${reflections.map(r => `- ${r.content}`).join('\n')}`;
    let messages = [];
    if (history && Array.isArray(history) && history.length > 0) {
      messages = [...history];
    } else {
      messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: message });
    }
    // Always prepend system prompt if not present
    if (!messages.some(m => m.role === 'system')) {
      messages.unshift({ role: 'system', content: systemPrompt });
    }
    // Debug logging (do not log API key)
    console.log('--- /api/chat called ---');
    console.log('User:', req.user.email);
    console.log('System prompt:', systemPrompt);
    console.log('Messages sent to Groq:', JSON.stringify(messages, null, 2));
    const groqRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      }
    });
    console.log('Groq API response:', JSON.stringify(groqRes.data, null, 2));
    res.json(groqRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Groq API error:', err.response.data);
      res.status(err.response.status).json({ error: err.response.data.error || 'Groq API error' });
    } else {
      console.error('Failed to contact Groq API:', err.message);
      res.status(500).json({ error: 'Failed to contact Groq API' });
    }
  }
});

app.get('/', (req, res) => {
  res.send('Second Brain API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 