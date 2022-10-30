const express = require("express");
const router = express.Router();
const Parts = require("../Controllers/Parts");

router.post("/ReadPartsFile", Parts.Start);
router.post("/ClearDB", Parts.ClearDB);

module.exports = router;
