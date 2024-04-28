const mongoose = require("mongoose");

const educationVerificationSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        verificationId: { type: String, required: true },
        verifierEmail: { type: String, required: true },
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

const Education_Verification = mongoose.model(
    "Education_Verification",
    educationVerificationSchema,
);

module.exports = Education_Verification;
