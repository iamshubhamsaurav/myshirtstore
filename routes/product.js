const express = require('express')

const router = express.Router()

const {
    getAllProduct,
    getSingleProduct,
    createProduct,
    adminDeleteOneProduct,
    adminUpdateOneProduct,
    adminGetAllProducts,
    getReviewsForOneProduct,
    deleteReview,
    addReview
} = require('../controllers/productController')

const {isLoggedIn} = require('../middlewares/user')

router.route('/products').get(getAllProduct)
router.route('/products/:id').get(getSingleProduct)

router.route("/review").put(isLoggedIn, addReview);
router.route("/review").delete(isLoggedIn, deleteReview);
router.route("/reviews").get(isLoggedIn, getReviewsForOneProduct);

//admin routes
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole("admin"), createProduct);

router
  .route("/admin/products")
  .get(isLoggedIn, customRole("admin"), adminGetAllProducts);

router
  .route("/admin/product/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOneProduct)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneProduct);

module.exports = router