const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// 1. CORS - Must be first to handle preflight requests
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://nexus-backend-sepia.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow any vercel.app domain in production
        const isVercel = origin.endsWith('.vercel.app');
        
        if (allowedOrigins.indexOf(origin) !== -1 || isVercel) {
            return callback(null, true);
        } else {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// 2. Security Headers
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// 3. Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// 4. Body Parsers
app.use(express.json());
app.use(morgan('dev'));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Backend is running' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('PixelForge Nexus API is running...');
    });
}

// Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    errorHandler(err, req, res, next);
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
