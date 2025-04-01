const express = require("express");
const app = express();
const winston = require("winston");

// Create logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: "calculator-service" },
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

// Arithmetic operations
const add = (n1, n2) => n1 + n2;
const subtract = (n1, n2) => n1 - n2;
const multiply = (n1, n2) => n1 * n2;
const divide = (n1, n2) => {
    if (n2 === 0) {
        throw new Error("Division by zero is not allowed");
    }
    return n1 / n2;
};

// Dynamic route for single operations
app.get("/:operation", (req, res) => {
    console.log("Received request:", req.query);
    try {
        const n1 = parseFloat(req.query.n1);
        const n2 = parseFloat(req.query.n2);
        const operation = req.params.operation;

        if (isNaN(n1)) {
            logger.error("n1 incorrectly defined");
            throw new Error("n1 incorrectly defined");
        }
        if (isNaN(n2)) {
            logger.error("n2 incorrectly defined");
            throw new Error("n2 incorrectly defined");
        }

        let result;
        switch (operation) {
            case "add":
                result = add(n1, n2);
                break;
            case "subtract":
                result = subtract(n1, n2);
                break;
            case "multiply":
                result = multiply(n1, n2);
                break;
            case "divide":
                result = divide(n1, n2);
                break;
            default:
                logger.error(`Invalid operation: ${operation}`);
                throw new Error("Invalid operation. Use add, subtract, multiply, or divide.");
        }

        console.log("Computed result:", result);
        res.status(200).json({ statuscode: 200, data: result });
    } catch (error) {
        logger.error(error.message);  // 🔥 Logs error into error.log
        res.status(500).json({ statuscode: 500, msg: error.toString() });
    }
});

const port = 3040;
app.listen(port, () => {
    console.log("Server is running on port " + port);
});
