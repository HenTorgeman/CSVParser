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
    ProductionProcesses:{
        type:[Object]
    },
    STR:{
        type:Boolean
    },
    RM:{
        type:Object
    },
    KeyMachine:{
        type:String
    },
    Price:{
        type:Number
    },
    LT:{
        type:Number
    },

   
    
});
module.exports = mongoose.model("Part", PartSchema);
