const express = require("express");
const router = express.Router();

// Importing middlewares
const verifyUser = require("../middlewares/user.mw");

// Importing routes
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const toolsRoute = require("./tools.route");
const skillRoute = require("./skill.route");
const skillCategoryRoute = require("./skill-category.route");
const institutionRoute = require("./institution.route");
const dashboardRoute = require("./dashboard.route");
const learningsRoute = require("./learnings.route");

const authstaffRoute = require("./authStaff.route");

// Non authorization routes
router.use("/auth", authRoute);
router.use("/authstaff", authstaffRoute);

// Authorization routes
router.use("/user", verifyUser, userRoute);
router.use("/tools", verifyUser, toolsRoute);
router.use("/dashboard", verifyUser, dashboardRoute);
router.use("/learnings", verifyUser, learningsRoute);
router.use("/skill", verifyUser, skillRoute);
router.use("/skill-category", verifyUser, skillCategoryRoute);

// router.use("/staff",)

router.use("/institution", institutionRoute);

module.exports = router;
