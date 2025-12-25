const mongoose = require('mongoose');

// Defines the schema for the Book model.
const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Please provide an author'],
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    status: {
        type: String,
        enum: ['Available', 'Out of Stock'],
        default: 'Available'
    }
});

// Middleware to update the book's status based on its quantity before saving.
BookSchema.pre('save', function(next) {
    if (this.quantity > 0) {
        this.status = 'Available';
    } else {
        this.status = 'Out of Stock';
    }
    next();
});

module.exports = mongoose.model('Book', BookSchema);
