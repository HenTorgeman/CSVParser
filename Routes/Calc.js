const express = require("express");
const router = express.Router();
const Calc = require("../Controllers/Calc");

// router.get("/GetCircels", Calc.GetCircels);
// router.get("/CreateDirections", Calc.CreateDirections);
// router.post("/CreateCoCircels", Calc.CreateCoCircels);
// router.get("/GetCoCircelsDataTest", Calc.GetCoCircelsDataTest);
router.post("/ClearDB", Calc.ClearDB);

module.exports = router;
