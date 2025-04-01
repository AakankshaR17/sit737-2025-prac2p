const express = require("express");
const fs = require("fs");
const winston = require("winston");

const app = express();

// Create a Winston logger instance
const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: "add-service" },
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }), // Logs errors only
        new winston.transports.File({ filename: "combined.log" }), // Logs all messages
    ],
});

// Add console logging when not in production
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    );
}

// Function to add two numbers
const add = (n1, n2) => n1 + n2;

app.get("/add", (req, res) => {
    try {
        const n1 = parseFloat(req.query.n1);
        const n2 = parseFloat(req.query.n2);

        if (!req.query.n1 || isNaN(n1)) {
            logger.error("n1 is missing or incorrectly defined");
            return res.status(400).json({ statuscode: 400, msg: "n1 is missing or incorrectly defined" });
        }
        if (!req.query.n2 || isNaN(n2)) {
            logger.error("n2 is missing or incorrectly defined");
            return res.status(400).json({ statuscode: 400, msg: "n2 is missing or incorrectly defined" });
        }

        logger.info(`Parameters received: n1=${n1}, n2=${n2}`);
        const result = add(n1, n2);
        
        logger.info(`Addition result: ${result}`);
        res.status(200).json({ statuscode: 200, data: result });
    } catch (error) {
        logger.error(error.toString());
        res.status(500).json({ statuscode: 500, msg: error.toString() });
    }
});

// Check if error log file exists
if (!fs.existsSync("error.log")) {
    console.log("Error log file not found. It will be created when an error occurs.");
} else {
    console.log("Error log file exists.");
}

// Start the server
const port = 3040;
app.listen(port, () => {
    console.log("Server is running on port " + port);
});
