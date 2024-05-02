const mongoose = require("mongoose");

const dailyLearningSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        date: { type: Date, required: true },
        learned: { type: Number, default: 0 },
    },
    { timestamps: true },
);

const Daily_Learning = mongoose.model("Daily_Learning", dailyLearningSchema);
module.exports = Daily_Learning;
