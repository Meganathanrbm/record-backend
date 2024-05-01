const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        educationId: { type: String, required: true },
        degree: { type: String, required: false },
        institution: { type: String, required: false },
        branch: { type: String, required: false },
        rollNumber: { type: String, required: false },
        startMonthYear: { type: String, required: false },
        endMonthYear: { type: String, required: false },
        grade: { type: String, required: false },
        activitiesRoles: { type: String, required: false },
        verified: { type: Boolean, default: false },
        verificationId: { type: String, required: false },
    },
    { timestamps: true },
);

const Education = mongoose.model("Education", educationSchema);
module.exports = Education;
