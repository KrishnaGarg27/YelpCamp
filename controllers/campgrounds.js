const Campground = require('../models/campgrounds.js')
const { cloudinary } = require('../utils/storage.js')
const maptilerClient = require('@maptiler/client')

maptilerClient.config.apiKey = process.env.MAPTILER_KEY

module.exports.renderIndex = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNew = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res) => {
    if (req.files.length === 0) {
        req.flash('error', 'Atleast one image is required')
        return res.redirect('/campgrounds/new')
    }
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 })
    const campground = new Campground(req.body.campground)
    campground.images = req.files.map(file => ({
        url: file.path,
        filename: file.filename
    }))
    campground.author = req.user._id
    campground.geometry = geoData.features[0].geometry
    await campground.save()
    req.flash('success', 'Successfully added new Campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.renderShow = async (req, res) => {
    const id = req.params.id
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if (!campground) {
        req.flash('error', 'Campground does not exist')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEdit = async (req, res) => {
    const id = req.params.id
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Campground does not exist')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.editCampground = async (req, res) => {
    const id = req.params.id
    const imgs = req.files.map(file => ({
        url: file.path,
        filename: file.filename
    }))
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 })
    const geometry = geoData.features[0].geometry
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground, geometry, $push: { images: { $each: imgs }}})
    if (req.body.deleteImages) {
        if (req.body.deleteImages.length === campground.images.length && req.files.length === 0) {
            req.flash('error', 'Atleast one image is required')
            return res.redirect(`/campgrounds/${campground._id}/edit`)
        }
        for (let img of req.body.deleteImages) {
            await cloudinary.uploader.destroy(img)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}})
    }
    req.flash('success', 'Successfully updated the Campground')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampgrounds = async (req, res) => {
    const id = req.params.id
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted the Campground')
    res.redirect('/campgrounds')
}