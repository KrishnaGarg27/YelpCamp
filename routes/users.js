const express = require("express");
const router = express.Router();
const passport = require("passport");

const users = require("../controllers/users.js");
const catchAsync = require("../utils/catchAsync");
const { isNotLoggedIn, saveReturnTo } = require("../utils/middlewares.js");

router
  .route("/register")
  .get(isNotLoggedIn, users.renderRegister)
  .post(isNotLoggedIn, catchAsync(users.register));

router
  .route("/login")
  .get(isNotLoggedIn, users.renderLogin)
  .post(
    isNotLoggedIn,
    saveReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

router.get("/logout", users.logout);

module.exports = router;
