const BigPromise = require('../middlewares/bigPromise')

exports.home = BigPromise((req, res) => {
    res.status(200).json({
        success: true,
        message: "Hello from API"
    })
})

exports.homeDummy = (req, res) => {
    res.status(200).json({
        success: true,
        message: "Hello from home dummy"
    })
}