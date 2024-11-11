const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { storeEmail } = require('./email-storage');
const { storeName } = require('./name-storage');
const { isValidEmailDomain } = require('./email-validator');
const dbConfig = require('./config/database');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(dbConfig.mongoURI, dbConfig.options)
    .then(() => {
        console.log('Connected to MongoDB');
    }).catch(err => {
        console.error('MongoDB connection error:', err);
    });


// Message Schema with validation
const messageSchema = new mongoose.Schema({
    e_mail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    e_mail_provider: {
        type: String,
        required: true,
        trim: true
    },
    Ime: {
        type: String,
        required: true,
        trim: true
    },
    Poruka: {
        type: String,
        required: true,
        trim: true,
        maxLength: 500
    },
    timestamp: {
        type: Date,
        default: () => new Date()
    }
}, { 
    collection: 'FORMA',
    versionKey: false,
    timestamps: false,
    toJSON: { getters: true }
});

// Add compound index to prevent duplicate messages from same user within a time window
messageSchema.index(
    { 
        e_mail: 1, 
        Poruka: 1,
        timestamp: 1 
    }, 
    { 
        unique: true,
        // Messages are considered duplicate if sent within 1 hour
        partialFilterExpression: {
            timestamp: {
                $gt: new Date(Date.now() - 60 * 60 * 1000)
            }
        }
    }
);

// Pre-save middleware to clean data
messageSchema.pre('save', function(next) {
    // Clean email and extract provider
    if (this.e_mail) {
        this.e_mail = this.e_mail.toLowerCase().trim();
        this.e_mail_provider = this.e_mail.split('@')[1].split('.')[0];
    }
    
    // Clean other fields
    if (this.Ime) this.Ime = this.Ime.trim();
    if (this.Poruka) this.Poruka = this.Poruka.trim();
    
    next();
});

const Message = mongoose.model('FORMA', messageSchema);

// Message submission route with duplicate check
app.post('/send-message', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate inputs
        if (!name || !email || !message) {
            return res.status(400).json({
                status: 'error',
                message: 'All fields are required'
            });
        }

        // Clean email
        const cleanEmail = email.toLowerCase().trim();

        // Validate email domain
        if (!isValidEmailDomain(cleanEmail)) {
            return res.status(400).json({
                status: 'error',
                message: 'Neispravna email adresa! Molimo koristite hrvatsku email adresu (.hr domenu) ili Gmail.'
            });
        }

        // Create new message
        const newMessage = new Message({
            e_mail: cleanEmail,
            e_mail_provider: cleanEmail.split('@')[1].split('.')[0],
            Ime: name.trim(),
            Poruka: message.trim()
        });

        // Save message
        const savedMessage = await newMessage.save();

        // Store email and name in existing collections
        await storeEmail(cleanEmail);
        await storeName(name);

        res.json({
            status: 'success',
            message: 'Message sent successfully',
            data: savedMessage
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Route to get all emails
app.get('/emails', async (req, res) => {
    try {
        const emails = await Email.find()
            .sort({ lastContact: -1 });

        res.json({
            status: 'success',
            data: emails
        });

    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Route to search emails
app.get('/emails/search/:query', async (req, res) => {
    try {
        const query = req.params.query.toLowerCase();
        
        const emails = await Email.find({
            $or: [
                { email: { $regex: query, $options: 'i' } },
                { provider: { $regex: query, $options: 'i' } }
            ]
        }).sort({ lastContact: -1 });

        res.json({
            status: 'success',
            data: EMAILS
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Route to check email validity
app.post('/check-email', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({
            status: 'error',
            message: 'Email is required'
        });
    }

    const isValid = isValidEmailDomain(email.toLowerCase().trim());
    
    res.json({
        status: 'success',
        data: {
            email: email,
            isValid: isValid
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 