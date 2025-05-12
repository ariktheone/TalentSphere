//setting.js
// This file contains the settings for the application
// including the database connection and other configurations
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');

const cors = require('cors');
const bodyParser = require('body-parser');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('./models/User'); // your Mongoose model
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // To handle cross-origin requests
app.use(bodyParser.json()); // To parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // To parse URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the public directory
app.use(express.static('public')); // Serve static files from the public directory


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() =>
    console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));
// Middleware to check JWT token
app.use((req, res, next) =>
    {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }
        try {

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded.user;
            next();
        }
        catch (ex) {
            res.status(400).json({ msg: 'Token is not valid' });
        }
    }
);
// POST route to handle user signup
app.post('/api/signup', [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ msg: 'Email already exists' });
        }
    try {
        const user = new User({ name, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = {
            user: {
                id: user.id
            }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
        }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
        }
    }
);
// POST route to handle user login

app.post('/api/login', [
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').not().isEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const payload = {
            user: {
                id: user.id
            }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
        }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
        }
    }
);
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Export the app for testing
module.exports = app;
