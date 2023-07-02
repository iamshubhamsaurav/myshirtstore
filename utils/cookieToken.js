function cookieToken(user, res) {
    const token = user.getJwtToken()

const options = {
    expires: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 100
    ),
    httpOnly: true
}

res.status(201)
    .cookie('token', token, options)
    .json({
        success: true,
        user,
        token
    })
}

module.exports = cookieToken;