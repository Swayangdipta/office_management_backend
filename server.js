const express = require('express')
const app = express()
const { dbConnection } = require('./utils/db.config')
const cookieParser = require('cookie-parser')
const cors = require('cors')
require('dotenv').config()

const PORT = process.env.PORT || 8080
// Route imports
const authRoutes = require('./routes/auth')
const hrmRoutes = require('./routes/hrm')
const adminRoutes = require('./routes/admin')
const sarsRoutes = require('./routes/sars')

const corsOptions = {
    origin: ['https://offmgmt.netlify.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};
// Middlewares
app.use(cookieParser())
app.use(express.json())
app.use(cors(corsOptions))

// Routes
app.use('/api',authRoutes)
app.use('/api',hrmRoutes)
app.use('/api',adminRoutes)
app.use('/api',sarsRoutes)

// Connecting to Dtabase and Starting the Server
dbConnection(app, PORT)