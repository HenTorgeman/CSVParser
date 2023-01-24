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
    ComplexityLevel:{
        type:Number
    },
    PartCalculation:{
        type:Object
    },
    PartInfo:{
        type:Object
    },
    ProductionProcesses:{
        type:[Object]
    },
    STR:{
        type:Boolean
    },
    RawMaterial:{
        type:Object
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
