const mongoose = require("mongoose");

const workExperienceSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        workExperienceId: { type: String, required: true },
        role: { type: String, required: false },
        companyName: { type: String, required: false },
        employeeId: { type: String, required: false },
        workType: { type: String, required: false },
        location: { type: String, required: false },
        locationType: { type: String, required: false },
        startDate: { type: Date, required: false },
        endDate: { type: Date, required: false },
        description: { type: String, default: false },
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

const WorkExperience = mongoose.model("WorkExperience", workExperienceSchema);
module.exports = WorkExperience;
