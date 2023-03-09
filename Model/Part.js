const mongoose = require("mongoose");

const PartSchema = new mongoose.Schema({
    PN: {
        type: String,
    },
    Index: {
        type: Number,
        default: 0,
    },
    FilePath: {
        type: String,
    },
    BoundingInfo:{
        type:Object
    },
    PartCalculation:{
        type:Object
    },
    PartAcssesability:{
        type:Object
    },
    PartInfo:{
        type:Object
    },
    ProductionProcesses:{
        type:[Object]
    },
    RawMaterial:{
        type:Object
    },
    RoughingMinuets:{
        type:Number
    },
    FinishingMinuets:{
        type:Number
    },
    Cost:{
        type:Number
    },
    LT:{
        type:Number
    },
    BatchTime:{
        type:Number
    },
    BatchCost:{
        type:Number
    },
});
module.exports = mongoose.model("Part", PartSchema);
