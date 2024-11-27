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

const corsOptions = {
    origin: 'https://offmgmt.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
// Middlewares
app.use(cookieParser())
app.use(express.json())
app.use(cors(corsOptions))

// Routes
app.use('/api',authRoutes)
app.use('/api',hrmRoutes)

// Connecting to Dtabase and Starting the Server
dbConnection(app, PORT)