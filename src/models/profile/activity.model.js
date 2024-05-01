const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        activityId: { type: String, required: true },
        activityName: { type: String, required: true },
        organisation: { type: String, required: true },
        activityType: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        description: { type: String, required: true },
        verified: { type: Boolean, default: false },
        verificationId: { type: String, required: false },
    },
    { timestamps: true },
);

const Activity = mongoose.model("Activity", activitySchema);
module.exports = Activity;
