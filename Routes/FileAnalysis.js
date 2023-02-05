const express = require("express");
const router = express.Router();
const FileAnalysis = require("../Controllers/KeyMachineProc");

router.post("/ClearDB", FileAnalysis.ClearDB);


module.exports = router;
