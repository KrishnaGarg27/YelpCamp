const express = require("express");
const router = express.Router({ mergeParams: true });

const reviews = require("../controllers/reviews.js");
const catchAsync = require("../utils/catchAsync.js");
const {
  isLoggedIn,
  isReviewAuthor,
  validateReview,
} = require("../utils/middlewares.js");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.postReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
