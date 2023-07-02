const express = require('express')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const fileUplaod = require('express-fileupload')

const app = express()

//Regular middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// fileUpload and cookieParser middleware
app.use(fileUplaod({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}))
app.use(cookieParser())

const morgan = require('morgan')

app.use(morgan('dev'))

const homeRoute = require('./routes/home')
const userRoute = require('./routes/user')
const productRoute = require('./routes/product')
const paymentRoute = require('./routes/payment')
const orderRoute = require('./routes/order')

app.use('/api/v1', homeRoute)
app.use('/api/v1', userRoute)
app.use('/api/v1', productRoute)
app.use('/api/v1', paymentRoute)
app.use('/api/v1', orderRoute)

module.exports = app