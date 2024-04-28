const mongoose = require("mongoose");

const passwordResetTokenSchema = new mongoose.Schema(
    {
        passwordResetTokenId: {
            type: String,
            unique: true,
        },
        userId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

const password_reset_token = mongoose.model(
    "password_reset_token",
    passwordResetTokenSchema,
);

module.exports = password_reset_token;
