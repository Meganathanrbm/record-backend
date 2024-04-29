const express = require("express");
const router = express.Router();

// Importing controllers
const profileController = require("../controllers/profile.controller");

router.get("/:userId", profileController.handleGetUserProfileInfo);

router.put("/", profileController.handleUpdateBasicProfile);

// Education routes
router.post("/education", profileController.handleAddEducation);

router.put("/education/:educationId", profileController.handleUpdateEducation);

// Work Experience routes

router.post("/work-experience", profileController.handleAddWorkExperience);

module.exports = router;
