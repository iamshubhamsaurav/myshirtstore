const app = require('./app');
const connectWithDb = require('./config/db');
require('dotenv').config()

const cloudinary = require('cloudinary')

// Connect with Database
connectWithDb()

// cloudinary config goes here
cloudinary.config({
    cloud_name: process.env.COULDINARY_NAME,
    api_key: process.env.COULDINARY_API_KEY,
    api_secret: process.env.COULDINARY_API_SECRET
})

app.listen(process.env.PORT, () => {
    console.log(`Listening to server on port: ${process.env.PORT}`);
})