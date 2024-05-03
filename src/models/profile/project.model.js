const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        projectId: { type: String, required: true },
        projectName: { type: String, required: true },
        associatedWith: { type: String, required: true },
        projectType: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        projectLink: { type: String, required: true },
        description: { type: String, required: true },
        verified: { type: Boolean, default: false },
        verificationId: { type: String, required: false },
        skills: [
            {
                skillId: { type: String, required: true },
                verified: { type: Boolean, default: false },
                endorsedBy: String,
                endorsedAt: Date,
            },
        ],
    },
    { timestamps: true },
);

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
