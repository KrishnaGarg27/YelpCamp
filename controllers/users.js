const User = require('../models/users.js')

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ username, email })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) {
                next(err)
            }
            req.flash('success', 'Welcome to Yelp Camp')
            res.redirect('/campgrounds')
        })
    } catch(err) {
        req.flash('error', err.message)
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back')
    const returnTo = res.locals.returnTo || '/campgrounds'
    res.redirect(returnTo)
}

module.exports.logout = (req, res) => {
    req.logout(err => {
        if (err) {
            return next(err)
        }
    })
    req.flash('success', 'Goodbye')
    res.redirect('/campgrounds')
}