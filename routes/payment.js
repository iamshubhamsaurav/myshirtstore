const express = require('express')

const router = express.Router()

const {sendStripeKey, captureStripePayment} = require('../controllers/paymentController')

const {isLoggedIn} = require('../middlewares/user')

router.route('/stripekey', isLoggedIn, sendStripeKey)
router.route('/capturestripekey', isLoggedIn, captureStripePayment)

module.exports = router