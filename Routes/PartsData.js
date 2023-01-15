const express = require("express");
const router = express.Router();
const controller = require("../Controllers/PartData");

router.post("/CreateDataSet",controller);
router.post("/GetPrice",controller);


module.exports = router;
