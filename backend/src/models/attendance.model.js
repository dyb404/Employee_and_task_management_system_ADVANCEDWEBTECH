const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    date: { type: Date, default: Date.now },
    checkIn: Date,
    checkOut: Date,
    status: {
        type: String,
        enum: ["present", "absent", "half_day"]
    }
});

module.exports = mongoose.model("Attendance", attendanceSchema);