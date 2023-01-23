const mongoose = require("mongoose");

const PartCalculationSchema = new mongoose.Schema({
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
    MD:{
        type: Number,
        default: 0,
    },
    FeatursNumber:{
        type: Number,
        default: 0,
    },
    AroundAxisNumber:{
        type:Number
    },
    AroundAxises:{
        type:[Object],
    },
    DirectionStr:{
        type: String
    },
   
    
});
module.exports = mongoose.model("PartCalculation", PartCalculationSchema);
