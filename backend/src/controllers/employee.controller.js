const Employee = require("../models/employee.model");

exports.createEmployee = async (req, res) => {
    // future change check if the employee already exists
    try {
        const employee = await Employee.create(req.body);
        res.status(201).json({ message: "Employee created", employee });
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find()
            .populate("user", "name email role");

        res.status(200).json(employees);
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate("user"); // will diplay sensitive data too {future change}

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json(employee);
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({ message: "Updated", employee });
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        res.status(200).json({ message: "Employee deactivated" });
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};