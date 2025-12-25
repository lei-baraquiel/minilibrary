const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes by verifying a user's JWT token.
const protect = async (req, res, next) => {
    let token;

    // Check if the 'Authorization' header is present and starts with 'Bearer'.
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from the header.
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using the JWT_SECRET.
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user by the ID from the token's payload.
            // Exclude the password field from the returned user object.
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    // If no token is found, send a 401 Unauthorized response.
    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
