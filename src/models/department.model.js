const { required } = require("joi");
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
    {
        instituionId: { type: String, required: true },
        departmentId: { type: String, required: true },
        name: { type: String, required: true },
        programType: { type: String, required: true },
        programDuration: { type: String, required: true },
    },
    { timestamps: true },
);

const Department = mongoose.model("Department", departmentSchema);
module.exports = Department;
