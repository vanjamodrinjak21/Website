const mongoose = require('mongoose');
const dbConfig = require('./config/database');

// Define the Email schema first
const emailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    }
}, { 
    collection: 'EMAILS',  // Use existing collection
    versionKey: false
});

// Create the model
const Email = mongoose.model('EMAILS', emailSchema);

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