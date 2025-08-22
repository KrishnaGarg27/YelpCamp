const mongoose = require('mongoose')
const Review = require('./reviews')
const Schema = mongoose.Schema

const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200')
})

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    images: [imageSchema],
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, {
    toJSON: {
        virtuals: true
    }
})

campgroundSchema.virtual('properties.popUp').get(function() {
    const popUp = `<a href="/campgrounds/${this._id}">${this.title}</a>
    <p>${this.description.substring(0, 30)}...</p>`
    return popUp
})

campgroundSchema.post('findOneAndDelete', async (campground) => {
    await Review.deleteMany({_id: {$in: campground.reviews}})
})

const Campground = mongoose.model('Campground', campgroundSchema)

module.exports = Campground