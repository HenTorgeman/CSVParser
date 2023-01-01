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
    MS:{
        type: Number,
        default: 0,
    },
    OriginalMS:{
        type: Number,
        default: 0,
    },
    Directions:{
        type: [Object]
    },
    DirectionStr:{
        type: String
    },
    FeatursNumber:{
        type: Number,
        default: 0,
    },
    ABnornalFeatCount:{
        type:Number,
        default:0
    },
    BoundingBox:{
        type:Object
    },
    ComplexityLevel:{
        type:Number
    },
    AroundAxisNumber:{
        type:Number
    },
    MachineOptions:{
        type:[Object],
    },
   
    
});
module.exports = mongoose.model("Part", PartSchema);
