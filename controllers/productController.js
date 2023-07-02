const Bigpromise = require('../middlewares/bigPromise')
const Product = require('../models/Product')
const CustomError = require('../utils/customError')
const cloudinary = require('cloudinary');
const WhereClause = require('../utils/whereClause');

exports.getAllProduct = Bigpromise(async (req, res, next) => {
    const resultPerPage = 3;
    const totalcountProduct = await Product.countDocuments();
  
    const productsObj = new WhereClause(Product.find(), req.query)
      .search()
      .filter();
  
    let products = await productsObj.base;
    const filteredProductNumber = products.length;
  
    //products.limit().skip()
  
    productsObj.pager(resultPerPage);
    products = await productsObj.base.clone();
  
    res.status(200).json({
      success: true,
      products,
      filteredProductNumber,
      totalcountProduct,
      resultPerPage,
    });
  });

exports.getSingleProduct = Bigpromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if(!product) {
        return next(new CustomError('Product not found', 404))
    }
    res.status(200).json({
        success: true,
        product
    })
})

exports.createProduct = Bigpromise(async (req, res, next) => {
    let imageArray = []

    if(!req.files) {
        return next(new CustomError('Images are required. Please send some images of product', 401))
    }

    for (let i = 0; i < req.files.photos.length; i++) {
        let result = await cloudinary.v2.uploader.upload(req.files.photos[i].tempFilePath, {
            folder: '/products'
        })
        imageArray.push({
            id: result.public_id,
            secure_url: result.secure_url
        })
    }

    req.body.photos = imageArray
    req.body.user = req.user.id

    const product = await Product.create(req.body)
    res.status(200).json({
        success: true,
        product
    })
    
})

exports.addReview = Bigpromise(async (req, res, next) => {
    const {rating, comment, productId} = req.body
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)

    const AlreadyReview = product.reviews.find(rev => {
        rev.user.toString() === req.user._id.toString()
    })

    if(AlreadyReview) {
        product.reviews.forEach(review => {
            if(review.user.toString() === req.user._id.toString()) {
                review.comment = comment
                review.rating = rating
            }
        });
    } else {
        product.reviews.push(AlreadyReview)
        product.numberOfReviews = product.reviews.length
    }

    //Adjust ratings

    product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

    //save
    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });     

})

exports.deleteReview = Bigpromise(async (req, res, next) => {
    const productId = req.query

    const product = await Product.findById(productId)

    const reviews = product.reviews.filter(rev => {
        rev.user.toString() === req.user._id.toString()
    })

    const numberOfReviews = reviews.length

    // adjust ratings

  product.ratings =
  product.reviews.reduce((acc, item) => item.rating + acc, 0) /
  product.reviews.length;

//update the product

await Product.findByIdAndUpdate(
  productId,
  {
    reviews,
    ratings,
    numberOfReviews,
  },
  {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  }
);

res.status(200).json({
  success: true,
});
})

exports.getReviewsForOneProduct = Bigpromise(async (req, res, next) => {
    const product = await Product.findByIdA(req.params.id)

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

// Admin controllers below
exports.adminGetAllProducts = Bigpromise(async (req, res, next) => {
    const products = await Product.find()
    res.status(200).json({
        success: true,
        products
    })
})

exports.adminUpdateOneProduct = Bigpromise(async (req, res, next) => {
    let product = await Product.findById(req.params.id)
    if(!product) {
        return next(new CustomError('Product not found', 404))
    }

    let imageArray = []
    if(req.files) {
        // delete the existing images
        for (let i = 0; i < product.photos.length; i++) {
            await cloudinary.v2.uploader.destroy(product.photos[i].id)
        }

        //upload new photos
        for (let i = 0; i < req.files.photos.length; i++) {
            const result = await cloudinary.v2.uploader.upload(req.files.photos[i].tempFilePath, {
                folder: '/products'
            })  
            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }
    }

    req.body.photos = imageArray

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    
    res.status(200).json({
        success: true,
        product,
    });
})

exports.adminDeleteOneProduct  = Bigpromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if(!product) {
        return next(new CustomError('Product not found', 404))
    }

    for (let i = 0; i < product.photos.length; i++) {
        await cloudinary.v2.uploader.destroy(product.photos[i].id)
    }

    await product.remove()

    res.status(200).json({
        success: true,
        message: 'Product has been deleted'
    })
})
