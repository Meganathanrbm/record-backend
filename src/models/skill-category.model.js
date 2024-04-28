const mongoose = require("mongoose");

const skillCategorySchema = new mongoose.Schema(
    {
        skillCategoryId: {
            type: String,
            unique: true,
        },
        categoryName: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

const SkillCategory = mongoose.model("SkillCategory", skillCategorySchema);

module.exports = SkillCategory;
