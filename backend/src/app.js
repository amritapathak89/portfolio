const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const apiRoutes = require("./routes/index");

const app = express();

// Restrict CORS to configured origins (comma-separated). Defaults to allow-all
// only when CORS_ORIGIN is unset, which is convenient for local development.
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : true;

app.use(cors({ origin: corsOrigin }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic health-check route.
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// Aggregated API routes.
app.use("/", apiRoutes);

module.exports = app;
