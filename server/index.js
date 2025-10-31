require('dotenv').config() // to use .env variables
const express = require('express')
const app = express()
app.use(express.json()) // needed to attach JSON data to POST body property

// MODULE IMPORTS
const nodemailer = require('nodemailer') // middleware to send e-mails
const cors = require('cors')
const bcrypt = require("bcrypt")
const session = require('express-session')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const http = require('http').Server(app)
const socketIO = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000"
  }
})

// MIDDLEWARES
app.use(cors())
app.use(express.static('build'))
app.use('/images', express.static('./images'))
app.use(session({ secret: 'matchac2r2p6', saveUninitialized: true, resave: true }))

// DATABASE
const { Pool } = require('pg')
const pool = new Pool({
  user: 'genfree',
  host: 'postgres-db',
  database: 'GenfreeDB',
  password: 'genfreepass',
  port: 5432,
})

const connectToDatabase = () => {
  pool.connect((err, client, release) => {
    if (err) {
      console.log('Error acquiring client', err.stack)
      console.log('Retrying in 5 seconds...')
      setTimeout(connectToDatabase, 5000)
    } else {
      console.log('Connected to database')
      release()
    }
  })
}
connectToDatabase()

// NODEMAILER
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD
  }
})

// MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'images/'),
  filename: (req, file, cb) =>
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
})
const upload = multer({ storage })

// ROUTES (after pool is ready!)
require('./routes/signup.js')(app, pool, bcrypt, transporter)
require('./routes/login_logout.js')(app, pool, bcrypt)
require('./routes/resetpassword.js')(app, pool, bcrypt, transporter)
require('./routes/profile.js')(app, pool, upload, fs, path, bcrypt)
require('./routes/browsing.js')(app, pool, transporter, socketIO)
require('./routes/chat.js')(pool, socketIO)
require('./routes/chat_api.js')(app, pool)
require('./routes/categories.js')(app, pool)
require('./routes/match.js')(app, pool);

// START SERVER
const PORT = process.env.PORT || 3001
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})
