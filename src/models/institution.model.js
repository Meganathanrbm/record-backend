const { required } = require("joi");
const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
    {
        instituionId: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String, required: true },
        establishedDate: { type: Date, required: true },
        address: { type: String, required: true },
        mobile: { type: String, required: true },
        email: { type: String, required: true },
        about: { type: String, required: true },
    },
    { timestamps: true },
);

const Institution = mongoose.model("Institution", institutionSchema);
module.exports = Institution;
