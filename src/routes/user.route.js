const express = require("express");
const router = express.Router();

// Importing controllers
const userController = require("../controllers/user.controller");

// Importing routes
const profileRoute = require("./profile.route");

// Check username availability
router.get(
    "/username-availability",
    userController.handleCheckUsernameAvailability,
);
// Update user
router.put("/username", userController.handleUpdateUsername);
// On Boarding
router.put("/onboarding", userController.handleOnBoarding);

// Profile Routes
router.use("/profile", profileRoute);

module.exports = router;
