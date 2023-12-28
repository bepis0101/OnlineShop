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
app.use(cookieParser())

// users = [
//     {
//         email: 'admin@admin.com',
//         password: await bcrypt.hash('admin', 10)
//     }
// ]


function authorize(req, res, next) {
    if ( req.signedCookies.user ) {
        req.user = req.signedCookies.user
        next()
    } else {
        res.redirect('/login?returnUrl=' + req.url)
    }
}

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.render('guest.ejs', { user: req.user })
})

app.get('/logout', authorize, (req, res) => {
    res.cookie('user', '', { maxAge: -1 })
    res.redirect('/')
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
})

app.post('/login', async (req, res) => {
    const email = req.body.email
    const password = await bcrypt.hash(req.body.password, 10)
    const returnUrl = req.body.returnUrl
    
})

app.get('/register', (req, res) => {
    res.render('register.ejs')
})

