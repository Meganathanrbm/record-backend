const express = require("express");
const router = express.Router();

// Importing controllers
const authStaffController = require("../controllers/authStaff.controller");

// Importing middlewares
const verifyUser = require("../middlewares/user.mw");

// Manual Auth Routes
router.post("/register", authStaffController.handleRegister);
router.post("/login", authStaffController.handleLogin);
router.post("/logout", authStaffController.handleLogout);

// reset password routes
router.post("/forgot-password", authStaffController.handleSendResetPassMail);
router.post(
    "/change-password/:password_reset_token",
    authStaffController.handleResetPass,
);

// Session routes
router.post("/verify-session", authStaffController.handleVerifiySession);

module.exports = router;
