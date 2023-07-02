const express = require('express')
const { createOrder, getOneOrder, getLoggedInUserOrder, adminGetAllOrder, adminUpdateOneOrder, adminDeleteOneOrder } = require('../controllers/orderController')
const { isLoggedIn } = require('../middlewares/user')

const router = express.Router()

router.route('/order/create').post(isLoggedIn, createOrder)
router.route('/order/:id').get(isLoggedIn, getOneOrder)
router.route('/myorder').get(isLoggedIn, getLoggedInUserOrder)

// Admin routes
router
  .route("/admin/orders")
  .get(isLoggedIn, customRole("admin"), adminGetAllOrder);
router
  .route("/admin/order/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOneOrder)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneOrder);

module.exports = router