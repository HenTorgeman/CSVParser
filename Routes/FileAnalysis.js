const express = require("express");
const router = express.Router();
const FileAnalysis = require("../Controllers/FileAnalysis");

router.post("/ClearDB", FileAnalysis.ClearDB);


module.exports = router;
