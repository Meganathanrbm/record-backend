const express = require("express");
const router = express.Router();

// Importing Controllers
const dashboardControllers = require("../controllers/dashboard.controller");

router.get("/", dashboardControllers.handleGetDashboard);

module.exports = router;
