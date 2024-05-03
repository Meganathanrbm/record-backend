const { required } = require("joi");
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
    {
        institutionId: { type: String, required: true },
        departmentId: { type: String, required: true },
        name: { type: String, required: true },
        programType: { type: String, required: false },
        programDuration: { type: String, required: false },
    },
    { timestamps: true },
);

const Department = mongoose.model("Department", departmentSchema);
module.exports = Department;
