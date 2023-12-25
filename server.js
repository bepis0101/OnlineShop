const express = require('express')
const app = express()
const port = 8099
const cookieParser = require('cookie-parser')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(cookieParser())

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.render('guest.ejs')
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
})

app.get('/register', (req, res) => {
    res.render('register.ejs')
})

