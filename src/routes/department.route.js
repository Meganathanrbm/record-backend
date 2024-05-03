const express = require("express");
const router = express.Router();

// Importing controllers
const departmentController = require("../controllers/department.controller");

// Check if only admin

router.post("/:institutionId", departmentController.handleAddDepartment);
router.get("/:departmentId", departmentController.handleGetDepartment);
router.get("/all/:institutionId", departmentController.handleGetAllDepartment);
router.put("/:departmentId", departmentController.handleUpdateDepartment);

module.exports = router;
