const express = require('express');
const cors = require('cors');
const app = express();
const port = 9000;

// Enable CORS for all origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

app.post('/send-message', (req, res) => {
    // Log the incoming request
    console.log('Received request body:', req.body);
    
    // Send back a success response
    res.json({
        status: 'success',
        message: 'Message received'
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 