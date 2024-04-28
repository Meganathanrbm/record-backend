const express = require("express");
const router = express.Router();

// Importing controllers
const skillController = require("../controllers/skill.controller");

// Create skill route
router.post("/", skillController.handleCreateSkill);
// Get all skills route
router.get("/", skillController.handleGetAllSkills);

module.exports = router;
