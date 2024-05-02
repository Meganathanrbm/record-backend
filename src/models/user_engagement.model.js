const mongoose = require("mongoose");

const userEngagementSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        date: { type: Date, required: true },
        spentSeconds: { type: Number, default: 0 },
        lastConnected: { type: Date },
        lastDisconnected: { type: Date },
    },
    { timestamps: true },
);

const User_Engagement = mongoose.model("User_Engagement", userEngagementSchema);
module.exports = User_Engagement;
