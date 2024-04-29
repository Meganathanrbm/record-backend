const mongoose = require("mongoose");

const workExperienceVerificationSchema = new mongoose.Schema(
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

const Work_Experience_Verification = mongoose.model(
    "Work_Experience_Verification",
    workExperienceVerificationSchema,
);

module.exports = Work_Experience_Verification;
