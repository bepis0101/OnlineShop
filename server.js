const express = require('express')
const app = express()
const port = 8099
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
var mongoose = require('mongoose')

const { userModel, productModel, orderModel } = require('./mongoModels.js')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(cookieParser('secret123789'))

const uri = 'mongodb://localhost:27017/OnlineShopProject'
mongoose.connect(uri)
    .then(() => {console.log('Connected to MongoDB')})
    .catch((err) => { console.log(err) })


function authorize(req, res, next) {
    if ( req.signedCookies.user ) {
        req.user = req.signedCookies.user
        next()
    } else {
        req.user = { guest: true }
        next()
    }
}

function onlyAdmin(req, res, next) {
    if ( req.signedCookies.user && req.signedCookies.user.admin ) {
        console.log('Admin')
        next()
    } else {
        res.render('login', { message: 'You are not an admin' ,
                              user: { guest: true }})
    }
}

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});

app.get('/', authorize, (req, res) => {
    res.render('index.ejs', { user: req.user })
})

app.get('/logout', authorize, (req, res) => {
    res.cookie('user', '', { maxAge: -1 })
    res.redirect('/')
})

app.get('/login', authorize, (req, res) => {
    res.render('login.ejs', { user: req.user })
})

app.post('/login', authorize, async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    const user = await userModel.findOne({ email: email }).exec()

    if ( user == null ) {
        res.render('login', { message: 'User not found',
                              user: req.user })
    } 
    try {
        if ( await bcrypt.compare(password, user.password) ) {
            res.cookie('user', user, { signed: true })
            res.redirect('/')
        } else {
            res.render('login', { message: 'Password incorrect',
                                  user: req.user })
        }
    } catch (error) {
        res.status(500).send()
    }
    
})

app.get('/register', authorize, (req, res) => {
    res.render('register.ejs', { user: req.user })
})

app.post('/register', authorize, async (req, res) => {
    var ifUserExists = await userModel.find().where('email').equals(req.body.email).exec()
    try {
        if ( ifUserExists.length ) {
            res.render('login', { message: 'Email already registered',
                                  user: req.user })
        } else {
            
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const user = {
                email: req.body.email,
                password: hashedPassword,
                admin: false,
                guest: false
            }
            const newUser = await userModel.create(user)
            newUser.save()
                .then(() => { console.log('User registered') })
                .catch((err) => { console.log(err) })
            res.render('login', { success: 'User registered',
                                  user: req.user })
        }
    } catch(error) {
        console.log(error)
        res.redirect('/register')
    }
})
// admin
app.get('/admin', authorize, onlyAdmin, (req, res) => {
    res.render('admin.ejs', { user: req.user })
})

// admin/users
app.get('/admin/users', onlyAdmin, async (req, res) => {
    const users = await userModel.find().exec()
    res.render('users.ejs', { users: users })
})

app.get('/admin/editUser/:id', onlyAdmin, async (req, res) => {
    const id = req.params.id
    const user = await userModel.findById(id).exec()
    res.render('edituser.ejs', { user: user })
})

app.post('/admin/editUser/:id', onlyAdmin, async (req, res) => {
    if ( req.body.password ) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = {
            email: req.body.email,
            password: hashedPassword,
            admin: false,
            guest: false
        }
        await userModel.replaceOne({ _id: req.params.id }, user).exec()
    }
    res.redirect('/admin/users')
})

app.get('/admin/deleteUser/:id', onlyAdmin, async (req, res) => {
    const id = req.params.id
    const user = await userModel.findByIdAndDelete(id).exec()
    res.redirect('/admin/users')
})

// admin/products
app.get('/admin/products', onlyAdmin, async (req, res) => {
    const products = await productModel.find().exec()
    res.render('products.ejs', { products: products })
})

app.get('/admin/add', onlyAdmin, (req, res) => {
    res.render('addProd.ejs')
})

app.post('/admin/add', onlyAdmin, async (req, res) => {
    const product = {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        image: req.body.image,
        numInStock: req.body.nums
    }

    const newProduct = await productModel.create(product)
    newProduct.save()
        .then(() => { console.log('Product added') })
        .catch((err) => { console.log(err) })
    
    res.redirect('/admin/products')
})

app.get('/admin/deleteProd/:id', onlyAdmin, async (req, res) => {
    const id = req.params.id
    const product = await productModel.findByIdAndDelete(id).exec()
    res.redirect('/admin/products')
})

app.get('/admin/editProd/:id', onlyAdmin, async (req, res) => {
    const id = req.params.id
    const product = await productModel.findById(id).exec()
    res.render('editprod.ejs', { product: product })
})

app.post('/admin/editProd/:id', onlyAdmin, async (req, res) => {
    const id = req.params.id
    const product = {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        image: req.body.image,
        numInStock: req.body.nums
    }
    await productModel.replaceOne({ _id: id }, product).exec()
    res.redirect('/admin/products')
})

// admin/orders
app.get('/admin/orders', onlyAdmin, async (req, res) => {
    const orders = await orderModel.find().exec()
    res.render('orders.ejs', { orders: orders })
})
