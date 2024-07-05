const express = require("express");
const router = express.Router();
const submitRoutes = require("./submit-form.routes");

router.use("/", submitRoutes);

module.exports = router;
