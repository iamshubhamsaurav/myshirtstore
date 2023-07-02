const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        maxLength: [40, "Name should be less than 40 characters"]
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        validate: [validator.isEmail, 'Please provide a valid email'],
        unique: [true, 'Please provide a unique email']
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minLength: [true, 'Password should be min 6 characters'],
        select: false
    },
    role: {
        type: String,
        default: 'user',
    },
    photo: {
        id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        },
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// encrypt password
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next()
    this.password = await bcryptjs.hash(this.password, 10)
})

userSchema.methods.correctPassword = async function(enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password)
}

userSchema.methods.getJwtToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

// Generate forgot password token (string)
userSchema.methods.getForgotPasswordToken = function() {
    const forgotToken = crypto.randomBytes(20).toString('hex')

    // generating a hash to send back
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex')

    // time of token
    // 2 hr * 60 min * 60 sec * 1000 millisec
    this.forgotPasswordExpiry = Date.now() + 2 * 60 * 60 * 1000
    
    return forgotToken
}



module.exports = mongoose.model('User', userSchema)