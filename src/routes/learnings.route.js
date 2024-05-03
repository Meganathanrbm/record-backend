const express = require("express");
const router = express.Router();

// Importing Controllers
const learningsController = require("../controllers/learnings.controller");

router.get("/course/:courseId", learningsController.handleGetCourse);

router.get("/course");

router.put("/progress", learningsController.handleUpdateCourseProgress);

router.put("/goal", learningsController.handleSetLearningGoal);

router.put("/addnotes", learningsController.handleAddNotes);
router.get("/getnotes", learningsController.handleGetNotes);
router.put("/updatenotes", learningsController.handleUpdateNotes);
router.delete("/deletenotes", learningsController.handleDeleteNotes);

module.exports = router;
