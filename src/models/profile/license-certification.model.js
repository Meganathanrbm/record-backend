const mongoose = require("mongoose");

const licenseCertificationSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        licenseCertificationId: { type: String, required: true },
        certificationName: { type: String, required: true },
        organization: { type: String, required: true },
        doneVia: { type: String, required: true },
        issuedDate: { type: Date, required: true },
        expirationDate: { type: Date, required: true },
        credentialId: { type: String, required: true },
        credentialURL: { type: String, required: true },
        verified: { type: Boolean, default: false },
        verificationId: { type: String, required: false },
        skills: [
            {
                name: { type: String, required: true },
                verified: { type: Boolean, default: false },
                endorsedBy: String,
                endorsedAt: Date,
            },
        ],
    },
    { timestamps: true },
);

const LicenseCertification = mongoose.model(
    "LicenseCertification",
    licenseCertificationSchema,
);
module.exports = LicenseCertification;
