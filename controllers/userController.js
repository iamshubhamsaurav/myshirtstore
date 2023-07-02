const User = require('../models/User')
const Bigpromise = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')
const cookieToken = require('../utils/cookieToken')
const cloudinary = require('cloudinary')
const mailHelper = require('../utils/mailHelper')
const crypto = require('crypto')

exports.signup = Bigpromise(async (req, res, next) => {
    
    let result;
    if(req.files) {
        // Tell the front end dev to send the file with photo name attribute
        let file = req.files.photo
        result = await cloudinary.v2.uploader.upload(file.tempFilePath,{
            folder: "users",
            width: 150,
            crop: "scale"
        })
    }

    console.log(result)
    
    const {name, email, password} = req.body

    if(!email || !name || !password) {
        return next(CustomError("Name, email and password are required", 400))
    }

    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    })

    cookieToken(user, res)


})

exports.login = Bigpromise(async (req, res, next) => {
    const {email, password} = req.body
    if(!email || !password) {
        return next(new CustomError("Please provide email and password", 400))
    }

    const user = await User.findOne({email}).select("+password")
    if(!user) {
        return next(new CustomError("Invalid email or password", 404))
    }

    const isPasswordCorrect = await user.correctPassword(password)

    if(!isPasswordCorrect) {
        return next(new CustomError("Invalid email or password", 400))
    }

    // everything is alright, user is loggedin. Send the token...
    cookieToken(user, res)

})

exports.logout = Bigpromise(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "Logout successfull..."
    })
})

exports.forgotPassword = Bigpromise(async (req, res, next) => {
    const {email} = req.body

    const user = await User.findOne({email})

    if(!user) {
        return next(new CustomError('Email is not registered', 400))
    }

    const forgotToken = user.getForgotPasswordToken()

    // save as token expiry is generated but not saved into the db
    await user.save({validateBeforeSave: false})
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`
    const message = `Use this link to reset your password ${myUrl}`

    try {
        await mailHelper({
            email: user.email,
            subject: "Password Reset Mail",
            message
        })
        res.status(200).json({
            success: true,
            message: 'Email sent successfully.'
        })
    } catch (error) {
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined

        await user.save({validateBeforeSave: false})
        return next(new CustomError(error.message, 500))
    }
})

exports.passwordReset = Bigpromise(async (req, res, next) => {
    const token = req.params.token

    const encryToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
        forgotPasswordToken: encryToken,
        forgotPasswordExpiry: {$gt: Date.now()},
    })
    

    if(!user) {
        return next(new CustomError('Token is invalid or expired', 400))
    }

    if(req.body.password !== req.body.confirmPassword) {
        return next(new CustomError('Password and confirm password do not match', 400))
    }

    
    // update the password 
    user.password = req.body.password

    // reset token fields
    user.forgotPasswordExpiry = undefined
    user.forgotPasswordToken = undefined
    console.log("After changing password and before save")
    console.log(user)
    // save the new password
    await user.save()

    // send response 
    cookieToken(user, res)
})

exports.getLoggedInUserDetails = Bigpromise(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        user
    })
})

// Updating user passsword
exports.changePassword = Bigpromise(async (req, res, next) => {
    const userId = req.user.id

    const user = await User.findById(userId).select('+password')

    if(!user) {
        return next(new CustomError("User does not exist", 404))
    }

    // checking old password
    const isOldPasswordCorrect = await user.correctPassword(req.body.oldPassword)
    if(!isOldPasswordCorrect) {
        return next("Old password is incorrect", 400)
    }

    // changing the password
    user.password = req.body.password

    // saving the password
    await user.save()
    cookieToken(user, res)

})

// Updating user details
exports.updateUserDetails = Bigpromise(async (req, res, next) => {
    const newData = {
        name: req.body.name,
        email: req.body.email
    }
    // upload the photo if it comes to us
    if(req.files) {
        const user = await User.findById(req.user.id)

        const imageId = user.photo.id

        // delete the existing photo on cloudinary
        await cloudinary.v2.uploader.destroy(imageId)

        // upload the new photo
        const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale",
        })

        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        }
    }

    // update the data in the user
    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        runValidators: true,
        new: true
    })

    res.status(200).json({
        success: true,
        user
    })
})

// Admin only routes
exports.adminAllUsers = Bigpromise(async (req, res, next) => {
    const users = await User.find()
    res.status(200).json({
        success: true,
        users
    })
})

exports.adminGetSingleUser = Bigpromise(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if(!user) {
        return next(new CustomError("User does not exists", 404))
    }
    res.status(200).json({
        success: true,
        user
    })
    
})

exports.adminUpdateSingleUser = Bigpromise(async (req, res, next) => {
    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }
    const user = await User.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true
    })

    if(!user) {
        return next(new CustomError("Failed to update user due to some issues. Please try again later...", 401))
    }
    
    res.status(200).json({
        success: true,
        user
    })
})

exports.adminDeleteSingleUser = Bigpromise(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if(!user) {
        return next(new CustomError("User does not exist", 404))
    }

    // deleting the photo from cloudinary
    const imageId = user.photo.id
    await cloudinary.v2.uploader.destroy(imageId)

    // deleting the user
    await user.remove()

    res.status(200).json({
        success: true,
        message: "User successfully deleted"
    })
})


// Manager only routes
exports.manageAllUser = Bigpromise(async (req, res, next) => {
    const users = await User.find({role: 'user'})
    res.status(200).json({
        success: true,
        users
    })
})