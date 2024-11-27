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

// Middlewares
app.use(cookieParser())
app.use(express.json())
app.use(cors())

// Routes
app.use('/api',authRoutes)
app.use('/api',hrmRoutes)

// Connecting to Dtabase and Starting the Server
dbConnection(app, PORT)