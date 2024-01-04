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

module.exports = { userSchema };