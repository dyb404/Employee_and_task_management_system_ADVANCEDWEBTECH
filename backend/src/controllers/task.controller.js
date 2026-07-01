const Task = require("../models/task.model");
const Employee = require("../models/employee.model");

exports.createTask = async (req, res) => {
    try {
        const task = await Task.create({
            ...req.body,
            assignedBy: req.user.id
        });

        res.status(201).json({ message: "Task created", task });
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === "employee") {
            const employee = await Employee.findOne({ user: req.user.id });
            if (!employee) {
                return res.status(200).json([]);
            }
            query.assignedTo = employee._id;
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        const tasks = await Task.find(query)
            .populate({
                path: "assignedTo",
                populate: { path: "user", select: "name email role" }
            })
            .populate("assignedBy", "name");

        res.status(200).json(tasks);
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    // update status from pending to in progress to completed etc 
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (req.user.role === "employee" &&
            task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not allowed" });
        }

        task.status = req.body.status;
        await task.save();
        //why not saved in db
        res.status(200).json({ message: "Updated", task });

    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Employee restriction
        if (
            req.user.role === "employee" &&
            task.assignedTo.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: "Not allowed" });
        }

        await Task.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Task deleted" });
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};