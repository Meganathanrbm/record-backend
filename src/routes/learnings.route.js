const express = require("express");
const router = express.Router();

// Importing Controllers
const learningsController = require("../controllers/learnings.controller");

router.get("/", learningsController.handleGetUserLearnings);

router.put("/progress", learningsController.handleUpdateCourseProgress);

module.exports = router;
