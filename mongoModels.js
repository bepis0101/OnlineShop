var mongo = require('mongoose')

const userModel = mongo.model(
    'User',
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true
        },
        admin: Boolean,
        guest: Boolean
    },
    'users'
)

const productModel = mongo.model(
    'Product',
    {
        name: String,
        price: Number,
        description: String,
        image: String,
        numInStock: Number
    },
    'products'
)

const orderModel = mongo.model(
    'Order',
    {
        userMail: String,
        products: Array,
        quantities: [Number],
        total: Number,
    }

)


module.exports = { userModel, productModel, orderModel };