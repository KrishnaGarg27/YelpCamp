const Campground = require("../models/campgrounds.js");
const Review = require("../models/reviews.js");
const ExpressError = require("../utils/ExpressError.js");

module.exports.postReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) throw new ExpressError("Invalid Campground Id", 400);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Successfully posted the review");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  try {
    await Review.findByIdAndDelete(reviewId);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    res.send({ status: "success", reviewId });
  } catch (err) {
    res.send({ status: "error", reviewId });
  }
};
