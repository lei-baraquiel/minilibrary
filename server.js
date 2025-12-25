// Load environment variables from .env file
require('dotenv').config();

// Import necessary packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

// Import Mongoose models
const User = require('./models/User');
const Book = require('./models/Book');
const Transaction = require('./models/Transaction');

// Import auth middleware
const { protect } = require('./middleware/auth');

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// --- Database Connection ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1); // Exit process with failure
    }
};

connectDB();

// --- API Routes ---

// --- Authentication Routes ---

/**
 * @route   POST /api/register
 * @desc    Register a new user
 * @access  Public
 */
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create new user instance
        user = new User({
            username,
            password,
        });

        // Save user to database (password will be hashed by pre-save hook)
        await user.save();

        res.status(201).json({ success: true, message: 'User registered successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

/**
 * @route   POST /api/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check for user in the database
        const user = await User.findOne({ username }).select('+password');
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Compare entered password with stored hashed password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Create JWT payload
        const payload = {
            id: user._id,
        };

        // Sign and generate token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h', // Token expires in 1 hour
        });

        res.json({
            success: true,
            token,
            username: user.username
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


// --- Book Routes ---

/**
 * @route   GET /api/books
 * @desc    Get all available books
 * @access  Public
 */
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json({ success: true, data: books });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


// --- Transaction Routes (Protected) ---

/**
 * @route   POST /api/books/borrow/:id
 * @desc    Borrow a book
 * @access  Private
 */
app.post('/api/books/borrow/:id', protect, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        // Check if the book is available
        if (book.quantity < 1) {
            return res.status(400).json({ success: false, message: 'Book is out of stock' });
        }

        // Decrease book quantity
        book.quantity -= 1;
        await book.save();

        // Create a new transaction record
        const transaction = new Transaction({
            user: req.user.id,
            book: book._id,
        });
        
        await transaction.save();

        res.json({ success: true, message: 'Book borrowed successfully', data: book });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


/**
 * @route   POST /api/books/return/:id
 * @desc    Return a book
 * @access  Private
 */
app.post('/api/books/return/:id', protect, async (req, res) => {
    try {
        const transactionId = req.params.id;

        // Find the active transaction for this user and book
        const transaction = await Transaction.findOne({
            _id: transactionId,
            user: req.user.id,
            status: 'Borrowed',
        });
        
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Borrow record not found or book already returned' });
        }

        // Update transaction status to 'Returned'
        transaction.status = 'Returned';
        transaction.returnDate = new Date();
        await transaction.save();

        // Increase book quantity
        const book = await Book.findById(transaction.book);
        if (book) {
            book.quantity += 1;
            await book.save();
        }

        res.json({ success: true, message: 'Book returned successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


/**
 * @route   GET /api/history
 * @desc    Get user's borrowing history
 * @access  Private
 */
app.get('/api/history', protect, async (req, res) => {
    try {
        const history = await Transaction.find({ user: req.user.id })
            .populate('book', 'title author') // Populate book details
            .sort({ borrowDate: -1 }); // Sort by most recent first

        res.json({ success: true, data: history });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// --- Serve Frontend ---
// This section serves the static files for the frontend.
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- Server Initialization ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
