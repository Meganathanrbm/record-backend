const express = require("express");
const router = express.Router();

// Importing controllers
const profileController = require("../controllers/profile.controller");

router.get("/:userId", profileController.handleGetUserProfileInfo);

router.put("/", profileController.handleUpdateBasicProfile);

router.post("/education", profileController.handleAddEducation);

router.put("/education/:educationId", profileController.handleUpdateEducation);

module.exports = router;
