const express = require('express')
const app = express()
const port = 8099
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
var mongo = require('mongodb')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(cookieParser('secret123789'))

var users = [
    {
        email: 'admin@admin.com',
        password: bcrypt.hashSync('admin', 10),
        admin: true,
        guest: false
    },

    {
        email: 'a@b.com',
        password: bcrypt.hashSync('Abc123?', 10),
        guest: false
    }
]


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
    if ( req.user.admin) {
        res.redirect('/admin')
    } else {
       res.render('index.ejs', { user: req.user })
    }
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
    const returnUrl = req.body.returnUrl

    const user = users.find(user => user.email == email)

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
    try {
        if ( users.find(user => user.email == req.body.email) ) {
            res.render('login', { message: 'Email already registered',
                                      user: req.user })
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = {
            email: req.body.email,
            password: hashedPassword,
            admin: false,
            guest: false
        }
        users.push(user)
        res.render('login', { message: 'User registered',
                              user: req.user })
    } catch {
        console.log('Error')
        res.redirect('/register')
    }
})

app.get('/admin', authorize, (req, res) => {
    res.render('admin.ejs', { user: req.user })
})