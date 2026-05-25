const Attendance = require("../models/attendance.model");

exports.checkIn = async (req, res) => {
    try {
        const existing = await Attendance.findOne({
            employee: req.user.id,
            date: new Date().toDateString()
        });

        if (existing) {
            return res.status(409).json({ message: "Already checked in" });
        }

        const record = await Attendance.create({
            employee: req.user.id,
            checkIn: new Date(),
            status: "present"
        });

        res.status(201).json({ message: "Checked in", record });

    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const record = await Attendance.findOne({
            employee: req.user.id,
            date: new Date().toDateString()
        });

        if (!record || !record.checkIn) {
            return res.status(400).json({ message: "No check-in found" });
        }

        if (record.checkOut) {
            return res.status(409).json({ message: "Already checked out" });
        }

        record.checkOut = new Date();

        const hours =
            (record.checkOut - record.checkIn) / (1000 * 60 * 60);

        record.status = hours < 4 ? "half_day" : "present";

        await record.save();

        res.status(200).json({ message: "Checked out", record });

    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAttendance = async (req, res) => {
    try {
        const filter = {};

        if (req.user.role === "employee") {
            filter.employee = req.user.id;
        }

        const data = await Attendance.find(filter)
            .populate("employee");

        res.status(200).json(data);

    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};