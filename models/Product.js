const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Please provide product name'],
        maxLength: [120, "Product name should not be less than 120 characters"]
    },
    price: {
        type: String,
        required: [true, "Please provide product price"],
        maxLength: [6, 'Product price should not be less than 6 digits']
    },
    description: {
        type: String,
        required: [true, 'Please provide product description']
    },
    photos: [
        {
            id: {
                type: String,
                required: true,
            },
            secure_url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, "please select category from- short-sleeves, long-sleeves, sweat-shirts, hoodies"],
        enum: {
            values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
            message: "please select category ONLY from - short-sleeves, long-sleeves, sweat-shirts and hoodies "
        }
    },
    stock: {
        type: Number,
        required: [true, "please add a number in stock"],
    },
    brand: {
        type: String,
        required: [true, "please add a brand for clothing"],
    },
    ratings: {
        type: Number,
        default: 0,
    },
    numberOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true,
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: String,
                required: true
            },
            comment: {
                type: String,
                required: true
            },
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', productSchema)
