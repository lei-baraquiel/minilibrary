const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Defines the schema for the User model.
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false // Do not return password field when querying users
    }
});

// Middleware to hash the user's password before saving it to the database.
// This function is automatically called before a 'save' operation.
UserSchema.pre('save', async function(next) {
    // If the password has not been modified, move to the next middleware.
    if (!this.isModified('password')) {
        return next();
    }
    // Generate a salt and hash the password.
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare a given password with the hashed password in the database.
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
