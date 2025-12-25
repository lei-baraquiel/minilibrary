// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');
const Book = require('./models/Book');

// --- Database Connection ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected for Seeding...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

// --- Sample Data ---
const books = [
    { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', quantity: 5 },
    { title: "The Hitchhiker's Guide to the Galaxy", author: 'Douglas Adams', quantity: 3 },
    { title: 'Dune', author: 'Frank Herbert', quantity: 4 },
    { title: '1984', author: 'George Orwell', quantity: 2 },
    { title: 'Brave New World', author: 'Aldous Huxley', quantity: 1 },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', quantity: 3 },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', quantity: 0 },
    { title: 'Pride and Prejudice', author: 'Jane Austen', quantity: 5 },
    { title: 'The Catcher in the Rye', author: 'J.D. Salinger', quantity: 2 },
    { title: 'Fahrenheit 451', author: 'Ray Bradbury', quantity: 3 },
    { title: 'Moby Dick', author: 'Herman Melville', quantity: 1 },
];

// --- Seeding Function ---
const seedBooks = async () => {
    await connectDB();
    try {
        // Clear existing books
        await Book.deleteMany({});
        console.log('Existing books cleared.');

        // Insert new books
        await Book.insertMany(books);
        console.log('Database seeded with new books!');
    } catch (error) {
        console.error('Error seeding the database:', error);
    } finally {
        // Disconnect from the database
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
};

seedBooks();
