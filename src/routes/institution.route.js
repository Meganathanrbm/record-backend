const express = require("express");
const router = express.Router();

// Importing controllers
const institutionController = require("../controllers/institution.controller");

// Check if only admin

router.post("/", institutionController.handleAddInstitution);
router.get("/:institutionId", institutionController.handleGetInstitution);
router.put("/:institutionId", institutionController.handleUpdateInstiution);

module.exports = router;
