const express = require("express");
const router = express.Router();

// Importing controllers
const departmentController = require("../controllers/department.controller");

// Check if only admin

router.post("/:instituionId", departmentController.handleAddDepartment);
router.get("/:departmentId", departmentController.handleGetDepartment);
router.get("/all/:instituionId", departmentController.handleGetAllDepartment);
router.put("/:departmentId", departmentController.handleUpdateDepartment);

module.exports = router;
