const Order = require('../models/Order')
const BigPromise = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')

exports.createOrder = BigPromise(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
    } = req.body;
    
    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id,
    });
    
    res.status(200).json({
        success: true,
        order,
    });
})

exports.getOneOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if(!order) {
        return next(new CustomError('Cannot find the order.', 404))
    }
    res.status(200).json({
        success: true,
        order
    })
})

exports.getLoggedInUserOrder = BigPromise(async (req, res, next) => {
    const orders = await Order.find({user: req.user._id})
    if(!orders) {
        return next(new CustomError('Cannot find the order.', 404))
    }
    res.status(200).json({
        success: true,
        orders
    })
})


exports.adminGetAllOrder = BigPromise(async (req, res, next) => {
    const orders = await Order.find()
    if(!orders) {
        return next(new CustomError('Cannot find the order.', 404))
    }
    res.status(200).json({
        success: true,
        orders
    })
})

exports.adminUpdateOneOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if(order.orderStatus === 'Delivered') {
        return next(new CustomError('Order is already marked as Delivered', 400))
    }

    order.orderStatus = req.body.orderStatus;

    order.orderItems.forEach(async (prod) => {
        await updateProductStock(prod.product, prod.quantity);
    });
  
    await order.save();
  
    res.status(200).json({
        success: true,
        order,
    });
})

exports.adminDeleteOneOrder = BigPromise(async (req, res, next) => {
    const order = await Order.find(req.params.id)
    
    if(!order) {
        return next(new CustomError('Cannot find the order.', 404))
    }

    await order.remove()

    res.status(200).json({
        success: true,
        message: 'Order has been removed',
        order
    })
})




