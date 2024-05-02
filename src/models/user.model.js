const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        username: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: false },
        isActive: { type: Boolean, default: false },
        fullName: { type: String, required: false },
        profilePicture: { type: String, required: false },
        dateOfBirth: { type: String, required: false },
        gender: { type: String, required: false },
        mobile: { type: String, required: false },
        about: { type: String, required: false },
        socialMedia: {
            linkedin: { type: String, required: false },
            instagram: { type: String, required: false },
            twitter: { type: String, required: false },
            facebook: { type: String, required: false },
            behance: { type: String, required: false },
            personalWebsite: { type: String, required: false },
        },
        isUsernameUpdated: { type: Boolean, default: false },
        isOnBoardingCompleted: { type: Boolean, default: false },
        interestBasedSkills: { type: Array, default: [] },
        isEmailVerified: { type: Boolean, default: false },
        lastLogin: { type: Date },
        goalType: {
            type: String,
            enum: ["monthly", "yearly"],
        },
        goalHours: {
            type: Number,
        },
    },
    { timestamps: true },
);

const User = mongoose.model("User", userSchema);
module.exports = User;
