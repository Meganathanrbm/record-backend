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
const departmentRoute = require("./department.route");

// Non authorization routes
router.use("/auth", authRoute);
// router.use("/authstaff");

// Authorization routes
router.use("/user", verifyUser, userRoute);
router.use("/tools", verifyUser, toolsRoute);
router.use("/skill", verifyUser, skillRoute);
router.use("/skill-category", verifyUser, skillCategoryRoute);

// router.use("/staff",)

router.use("/institution", institutionRoute);
router.use("/department", departmentRoute);

module.exports = router;
