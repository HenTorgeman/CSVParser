const express = require("express");
const router = express.Router();
const Calc = require("../Controllers/Calc");


router.get("/ReadFile", Calc.ReadFile);
router.get("/CreateDirections", Calc.CreateDirections);
router.get("/RemoveDuplicateDirectionDB", Calc.RemoveDuplicateDirectionDB);




module.exports = router;