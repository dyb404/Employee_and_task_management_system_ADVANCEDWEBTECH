const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed,
            role
        });

        res.status(201).json({
            message: "User created",
            userId: user._id
        });

    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            accessToken: token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role
            }
        });

    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};