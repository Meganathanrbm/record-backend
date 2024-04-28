const express = require("express");
const router = express.Router();

// Importing controllers
const skillCategoryController = require("../controllers/skill-category.controller");

// Create skill category route
router.post("/", skillCategoryController.handleCreateSkillCategory);
// Update skill category route
router.put(
    "/:skillCategoryId",
    skillCategoryController.handleUpdateSkillCategory,
);

module.exports = router;
