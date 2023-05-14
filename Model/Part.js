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
    PartResults:{
        type:Object

    }
  
});
module.exports = mongoose.model("Part", PartSchema);
