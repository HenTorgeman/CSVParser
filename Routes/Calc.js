const express = require("express");
const router = express.Router();
const Calc = require("../Controllers/FileAnalysis");

router.post("/ClearDB", Calc.ClearDB);

module.exports = router;
