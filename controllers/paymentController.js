const bigPromise = require("../middlewares/bigPromise")
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


exports.sendStripeKey = bigPromise(async (req, res, next) => {
    res.status(200).json({
        success: true,
        clientkey: process.env.STRIPE_PUBLIC_KEY
    })
})

exports.captureStripePayment = bigPromise(async (req, res, next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',
        // optional
        metadata: {integration_check: 'accept_a_payment'}
    });

    res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret
    })
})