const Campground = require('../models/campgrounds.js')
const Review = require('../models/reviews.js')
const ExpressError = require('./ExpressError.js')
const { campgroundSchema, reviewSchema } = require('./schemas.js')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        if (req.method === 'GET') req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be logged in.')
        return res.redirect('/login')
    }
    next()
}

module.exports.isNotLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.flash('error', 'Already Logged In')
        return res.redirect('/campgrounds')
    }
    next()
}

module.exports.isAuthor = async (req, res, next) => {
    const id = req.params.id
    const campground = await Campground.findById(id)
    if (campground && !campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that.')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that.')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.saveReturnTo = (req, res, next) => {
    res.locals.returnTo = req.session.returnTo
    next()
}

module.exports.deleteReturnTo = (req, res, next) => {
    delete req.session.returnTo
    next()
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(e => e.message).join(', ')
        throw new ExpressError(msg, 401)
    } else {
        next()
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error){
        const msg = error.details.map(e => e.message).join(', ')
        throw new ExpressError(msg, 406)
    } else {
        next()
    }
}