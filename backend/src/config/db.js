const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}` +
                    `@${process.env.DB_CLUSTER}/${process.env.DB_NAME}` +
                    `?retryWrites=true&w=majority`;

        if (!process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_CLUSTER || !process.env.DB_NAME) {
            throw new Error("Missing environment variables for MongoDB connection");
        }

        await mongoose.connect(uri);

        console.log(" MongoDB Connected Successfully");
    } catch (error) {
        console.error(" MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;