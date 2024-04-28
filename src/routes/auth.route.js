const express = require("express");
const router = express.Router();

// Importing controllers
const authController = require("../controllers/auth.controller");

// Importing middlewares
const verifyUser = require("../middlewares/user.mw");

// Manual Auth Routes
router.post("/register", authController.handleRegister);
router.post("/login", authController.handleLogin);
router.post("/logout", authController.handleLogout);

// Verification routes
router.post(
    "/send/verification-email",
    verifyUser,
    authController.handleSendVerificationEmail,
);
router.post("/verify-email", authController.handleVerifyEmail);

// reset password routes
router.post("/forgot-password", authController.handleSendResetPassMail);
router.post(
    "/change-password/:password_reset_token",
    authController.handleResetPass,
);

// Session routes
router.post("/verify-session", authController.handleVerifiySession);

module.exports = router;
