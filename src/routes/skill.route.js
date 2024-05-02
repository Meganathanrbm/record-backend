const express = require("express");
const router = express.Router();

// Importing controllers
const skillController = require("../controllers/skill.controller");

// Importing Middlewares
const upload = require("../middlewares/multer.mw");

// Create skill route
router.post("/", upload.single("image"), skillController.handleCreateSkill);
// Get all skills route
router.get("/", skillController.handleGetAllSkills);

module.exports = router;
