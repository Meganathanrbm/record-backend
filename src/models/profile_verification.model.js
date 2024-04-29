const mongoose = require("mongoose");

const profileVerificationSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        verificationId: { type: String, required: true },
        verifierEmail: { type: String, required: true },
        verificationType: {
            type: String,
            required: true,
            enum: ["education", "work experience", "license certification"],
        },
        verified: { type: Boolean, default: false },
        revisions: [
            {
                revisionDate: { type: Date, default: Date.now },
                comments: String,
            },
        ],
    },
    { timestamps: true },
);

const Profile_Verification = mongoose.model(
    "Profile_Verification",
    profileVerificationSchema,
);

module.exports = Profile_Verification;
