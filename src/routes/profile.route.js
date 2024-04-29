const express = require("express");
const router = express.Router();

// Importing controllers
const profileController = require("../controllers/profile.controller");
const educationController = require("../controllers/education.controller");
const workExperienceController = require("../controllers/work-experience.controller");
const licenseCertificationController = require("../controllers/license-certification.controller");

router.get("/:userId", profileController.handleGetUserProfileInfo);

router.put("/", profileController.handleUpdateBasicProfile);

// Education routes
router.post("/education", educationController.handleAddEducation);

router.put(
    "/education/:educationId",
    educationController.handleUpdateEducation,
);

// Work Experience routes

router.post(
    "/work-experience",
    workExperienceController.handleAddWorkExperience,
);

router.put(
    "/work-experience/:workExperienceId",
    workExperienceController.handleUpdateWorkExperience,
);

// License Certification routes

router.post(
    "/license-certification",
    licenseCertificationController.handleAddLicenseCertification,
);

router.put(
    "/license-certification/:licenseCertificationId",
    licenseCertificationController.handleUpdateLicenseCertification,
);

module.exports = router;
