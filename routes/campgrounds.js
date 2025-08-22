const express = require('express')
const router = express.Router()
const multer = require('multer')
const { storage } = require('../utils/storage.js')
const upload = multer({ storage })

const campgrounds = require('../controllers/campgrounds.js')
const catchAsync = require('../utils/catchAsync.js')
const { isLoggedIn, isAuthor, deleteReturnTo, validateCampground } = require('../utils/middlewares.js')

router.route('/')
    .get(deleteReturnTo, catchAsync(campgrounds.renderIndex))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNew)

router.route('/:id')
    .get(deleteReturnTo, catchAsync(campgrounds.renderShow))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEdit))


module.exports = router