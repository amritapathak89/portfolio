const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./config/db");
const apiRoutes = require("./src/routes/index");

dotenv.config();

const app = express();
const PORT = process.env.APP_SERVER_PORT;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Use the aggregated API routes
app.use("/", apiRoutes);

// Basic route to test the server
app.get("/", (req, res) => {
    res.send("Backend is working!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
