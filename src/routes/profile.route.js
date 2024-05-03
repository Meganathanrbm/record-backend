const express = require("express");
const router = express.Router();

// Importing controllers
const profileController = require("../controllers/profile/profile.controller");
const educationController = require("../controllers/profile/education.controller");
const workExperienceController = require("../controllers/profile/work-experience.controller");
const licenseCertificationController = require("../controllers/profile/license-certification.controller");
const projectController = require("../controllers/profile/project.controller");
const activityController = require("../controllers/profile/activity.controller");

// Importing Middlewares
const upload = require("../middlewares/multer.mw");

router.get("/", profileController.handleGetUserProfileInfo);

router.put(
    "/picture",
    upload.single("image"),
    profileController.handleAddUserPicture,
);

router.put("/basic-profile", profileController.handleUpdateBasicProfile);

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

// Project routes

router.post("/project", projectController.handleAddProject);

router.put("/project/:projectId", projectController.handleUpdateProject);

// Activity routes

router.post("/activity", activityController.handleAddActivity);

router.put("/activity/:activityId", activityController.handleUpdateActivity);

module.exports = router;
