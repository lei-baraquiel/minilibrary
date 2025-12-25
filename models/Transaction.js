const mongoose = require('mongoose');

// Defines the schema for the Transaction model.
const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    borrowDate: {
        type: Date,
        default: Date.now
    },
    returnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Borrowed', 'Returned'],
        default: 'Borrowed'
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
