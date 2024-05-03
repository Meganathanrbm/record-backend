const express = require("express");
const router = express.Router();

// Importing Controllers
const learningsController = require("../controllers/learnings.controller");

router.get("/", learningsController.handleGetUserLearnings);

router.put("/progress", learningsController.handleUpdateCourseProgress);

router.put("/goal", learningsController.handleSetLearningGoal);

router.put("/addnotes", learningsController.handleAddNotes);
router.put("/updatenotes", learningsController.handleUpdateNotes);
router.delete("/deletenotes", learningsController.handleDeleteNotes);

module.exports = router;
