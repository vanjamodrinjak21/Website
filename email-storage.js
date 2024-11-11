const mongoose = require('mongoose');
const dbConfig = require('./config/database');

// Use existing EMAILS collection
const Email = mongoose.model('EMAILS');

// Function to store email
async function storeEmail(email) {
    try {
        const cleanEmail = email.toLowerCase().trim();
        await Email.findOneAndUpdate(
            { email: cleanEmail },
            { email: cleanEmail },
            { upsert: true }
        );
    } catch (error) {
        console.error('Error storing email:', error);
    }
}

module.exports = { storeEmail, Email }; 