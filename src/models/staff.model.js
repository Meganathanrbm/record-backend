const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
    staffId: {
        type: String,
        unique: true,
    },
    institutionId: { type: String, required: true },
    departmentId: { type: String, required: false },
    role: {
        type: String,
        enum: ["Administrator", "Staff"],
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        required: false,
    },
    mobile: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: { type: String, required: true },
});

const Staff = mongoose.model("Staff", staffSchema);
module.exports = Staff;
