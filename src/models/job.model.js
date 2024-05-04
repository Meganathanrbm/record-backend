const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        jobId: { type: String, required: true, unique: true },
        institutionId: { type: String, required: true, unique: true },
        companyName: { type: String, required: true },
        jobDesignation: { type: String, required: true },
        workplaceType: { type: String, required: true },
        jobLocation: { type: String, required: true },
        jobType: { type: String, required: true },
        openings: { type: Number, required: true },
        jobDescription: { type: String, required: true },
        skills: { type: Array, default: [] },
        departments: { type: Array, default: [] },
        postedOn: { type: Date, required: true },
        status: {
            type: String,
            enum: ["open", "closed"],
            default: "open",
        },
    },
    { timestamps: true },
);

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
