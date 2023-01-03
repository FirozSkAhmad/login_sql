const { createConnection } = require('mysql')
const router = require('./routes/routes')
require('dotenv').config()
const express = require('express')
const app = express()

app.use(express.json())

const DB = createConnection({
    host:process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

DB.connect((err) => {
    if (err) {
        console.log(err)
    }
    console.log('DB is connected...')
})

app.use('/', router)

app.listen(process.env.PORT, () => {
    console.log('Express app is connected on port:' + process.env.PORT)
})

