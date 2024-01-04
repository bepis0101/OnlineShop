var mongo = require('mongoose')

const userSchema = mongo.model(
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
        products: [{
            _id: mongo.Types.ObjectId, 
            quantity: Number
            }],
        total: Number,
    }

)


module.exports = { userSchema };