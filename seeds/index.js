const mongoose = require('mongoose')
const Campground = require('../models/campgrounds.js')
const cities = require('./cities.js')
const { places, descriptors } = require('./seedHelpers.js')

mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(() => {
    console.log('Database Connected')
})
.catch(err => {
    console.log('Database not Connected')
    console.log(err)
})

const randArr = array => array[Math.floor(Math.random() * array.length)]

async function seedDB() {
    await Campground.deleteMany({})
    for (let i = 0; i < 200; i++){

        let city = cities[Math.floor(Math.random() * 1000)]
        let location = `${city.city}, ${city.state}`
        let title = randArr(descriptors) + ' ' + randArr(places)
        let images = [{
            url: `https://picsum.photos/400?random=${Math.random()}`,
            filename: 'image'
        }]
        let price = Math.floor(Math.random() * 20) + 10
        let description = 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. In quidem aspernatur suscipit a neque debitis possimus voluptate id minima, provident explicabo. Doloribus explicabo sunt perferendis laborum eos hic facere asperiores.'
        let author = '689f2c9647bef44332b448ab'
        let geometry = {
            type: 'Point',
            coordinates: [city.longitude, city.latitude]
        }

        const camp = new Campground({title, location, images, description, price, author, geometry})
        await camp.save()
        
    }
}

seedDB().then(() => {
    mongoose.disconnect()
})