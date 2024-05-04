const express = require("express");
const router = express.Router();

// Importing controllers
const institutionController = require("../controllers/institution.controller");
const departmentController = require("../controllers/department.controller");

// Imoorting Middlewares
const verifyStaff = require("../middlewares/staff.mw");
const verifyRole = require("../middlewares/verifyRole.mw");

// Check if only admin

router.post("/", institutionController.handleAddInstitution);

router.get(
    "/profile",
    verifyStaff,
    verifyRole(["Administrator", "Staff"]),
    institutionController.handleGetInstitution,
);

router.put(
    "/profile",
    verifyStaff,
    verifyRole(["Administrator"]),
    institutionController.handleUpdateInstiution,
);

router.post(
    "/department",
    verifyStaff,
    verifyRole(["Administrator"]),
    departmentController.handleAddDepartment,
);

router.put(
    "/department/:departmentId",
    verifyStaff,
    verifyRole(["Administrator"]),
    departmentController.handleUpdateDepartment,
);

router.get(
    "/department",
    verifyStaff,
    verifyRole(["Administrator"]),
    departmentController.handleGetAllDepartment,
);

router.get(
    "/department/:departmentId",
    verifyStaff,
    verifyRole(["Administrator"]),
    departmentController.handleGetDepartment,
);

module.exports = router;
