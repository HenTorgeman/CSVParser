const express = require("express");
const router = express.Router();
const Parts = require("../Controllers/MachiningPart");

router.post("/ReadPartsFile", Parts.Start);
router.post("/PrintResults", Parts.Print);
router.post("/ClearDB", Parts.ClearDB);

module.exports = router;
