const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
        type: String,
        enum: ["pending", "in_progress", "completed"],
        default: "pending"
    },
    deadline: Date
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);