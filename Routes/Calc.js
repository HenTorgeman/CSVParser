const express = require("express");
const router = express.Router();
const Calc = require("../Controllers/Calc");


router.get("/GetCircels", Calc.GetCircels);
router.get("/CreateDirections", Calc.CreateDirections);
router.get("/CreateCoCircels", Calc.CreateCoCircels);
router.get("/CreateCoCircelsDB", Calc.CreateCoCircelsDB);
router.get("/GetCoCircelsDataTest", Calc.GetCoCircelsDataTest);
router.get("/OptimizeCoCircelsDB", Calc.OptimizeCoCircelsDB);


module.exports = router;