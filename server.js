const express = require('express')
const app = express()
const port = 8099
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
var mongoose = require('mongoose')

const { userSchema } = require('./mongoModels.js')

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

    const user = await userSchema.findOne({ email: email }).exec()

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
    var ifUserExists = await userSchema.find().where('email').equals(req.body.email).exec()
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
            const newUser = await userSchema.create(user)
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

app.get('/admin', authorize, (req, res) => {
    res.render('admin.ejs', { user: req.user })
})