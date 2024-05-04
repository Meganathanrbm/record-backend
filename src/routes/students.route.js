const express = require("express");
const router = express.Router();

// Importing controllers
const studentsController = require("../controllers/students.controller");

// Importing Middlewares
const verifyStaff = require("../middlewares/staff.mw");
const verifyRole = require("../middlewares/verifyRole.mw");

router.get(
    "/profile/:studentId",
    verifyStaff,
    verifyRole(["Administrator", "Staff"]),
    studentsController.handleGetStudentProfile,
);

module.exports = router;
