if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const helmet = require('helmet')
const MongoStore = require('connect-mongo')

const User = require('./models/users.js')
const ExpressError = require('./utils/ExpressError.js')
const mongoSanitize = require('./utils/mongoSanitize.js')
const campgroundRoutes = require('./routes/campgrounds.js')
const reviewRoutes = require('./routes/reviews.js')
const userRoutes = require('./routes/users.js')


mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('Database Connected')
    })
    .catch(err => {
        console.log('Database not Connected')
        console.log(err)
    })


const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(mongoSanitize({replaceWith: '_'}))
app.use(helmet({contentSecurityPolicy: false}))

const store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisIsASecretKey'
    }
})

const sessionConfig = {
    name: 'sid',
    store: store,
    secret: 'thisIsASecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user
    next()
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
})

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err
    if (!err.message) err.message = 'Something went Wrong'
    res.status(status).render('error', { err })
})

app.listen(3000, () => {
    console.log('Listening on Port 3000')
})