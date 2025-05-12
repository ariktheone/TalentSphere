const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // your Mongoose model

const app = express();

// Middleware
app.use(cors()); // To handle cross-origin requests
app.use(bodyParser.json()); // To parse JSON bodies

// POST route to handle user signup
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).send('All fields are required.');
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email already exists.');
    }

    // Hash the password before saving to database
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword); // Debugging

    // Create new user with hashed password
    const user = new User({ name, email, password: hashedPassword });
    await user.save(); // Save to database

    // Send success response
    res.status(201).json({ name: user.name, email: user.email });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).send('Server error.');
  }
});

// POST route to handle user login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).send('Email and password are required.');
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('Invalid email or password.');
    }

    // Debugging: Log user and password hash comparison
    console.log('Login request received:', req.body); // Log incoming data
    console.log('Password entered:', password);
    console.log('Password in DB (hashed):', user.password);

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password.trim(), user.password.trim());
    console.log('Password match result:', isMatch); // Debugging result

    if (!isMatch) {
      return res.status(400).send('Invalid email or password.');
    }

    // Send success response
    res.status(200).json({ message: 'Login successful', user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error.');
  }
});

// MongoDB connection (replace with your database URI)
mongoose.connect('mongodb://localhost:27017/talentsphere', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.log('MongoDB connection error:', err);
});

// Start the server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
