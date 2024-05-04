const express = require("express");
const router = express.Router();

// Importing Controllers
const placementController = require("../controllers/placement.controller");

// Importing Middlewares
const verifyStaff = require("../middlewares/staff.mw");
const verifyRole = require("../middlewares/verifyRole.mw");

router.get(
    "/home",
    verifyStaff,
    verifyRole(["Administrator", "Staff"]),
    placementController.handleGetPlacementHomePage,
);

router.post(
    "/job",
    verifyStaff,
    verifyRole(["Administrator"]),
    placementController.handleCreateJob,
);

router.get(
    "/job/:jobId",
    verifyStaff,
    verifyRole(["Administrator", "Staff"]),
    placementController.handleGetJob,
);

router.put(
    "/job/close",
    verifyStaff,
    verifyRole(["Administrator"]),
    placementController.handleCloseJob,
);

module.exports = router;
