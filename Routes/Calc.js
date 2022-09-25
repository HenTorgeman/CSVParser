const express = require("express");
const router = express.Router();
const Calc = require("../Controllers/Calc");


router.get("/GetCircels", Calc.GetCircels);
router.get("/CreateDirections", Calc.CreateDirections);

module.exports = router;