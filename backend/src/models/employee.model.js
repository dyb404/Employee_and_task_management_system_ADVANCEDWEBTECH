const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    designation: String,
    phone: String,
    hireDate: Date,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);