const express = require("express");
const router = express.Router();
const Controller = require("../Controllers/MachiningPart");

router.post("/ReadInputFile", Controller.ReadInputFile);
router.post("/ReadInputFileScript", Controller.ReadInputFileScript);

router.post("/ReadCMrrFile", Controller.ReadCMrrFile);
router.post("/ReadCSurfaceTreatmentFile", Controller.ReadCSurfaceTreatmentFile);
router.post("/ReadCRawMaterialFile", Controller.ReadCRawMaterialFile);
router.post("/ClearDB", Controller.ClearDB);
router.post("/ClearMachineDB", Controller.ClearMachineDB);
router.post("/ClearCMrrDB", Controller.ClearCMrrDB);
router.post("/ClearRawMaterialDB", Controller.ClearRawMaterialDB);
router.post("/ReadTestFile", Controller.ReadTestFile);
router.get("/Print", Controller.Print);




module.exports = router;
