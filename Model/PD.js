const mongoose = require("mongoose");

const PDSchema = new mongoose.Schema({
    PartNumber: {
        type: String,
    },
    NodeIndex:{
        type: Number,
    },
    Description: {
        type: String,
    },
    H: {
        type: Number,
    },
    W:{
        type: Number,
    },
    L:{
        type: Number,
    },
    Hb:{
        type: Number,
    },
    Wb:{
        type: Number,
    },
    Lb:{
        type: Number,
    },
    MD:{
        type:Number,
    },
    Surface:{
        type:Number,
    },
    NetWeight:{
        type:Object
    },
    Volume:{
        type:Object
    },
    MaxLength:{
        type:Number
    },
    Shape:{
        type:String
    },
    MaterialVoulme :{
        type:Number
    },
    Dimensions :{
        type:Number
    },
    ComplexityLevel :{
        type:Number
    },
    UnitCost :{
        type:Number
    },
    SetUpCost:{
        type:Number
    },
    UnitLT:{
        type:Number
    },
    
});
module.exports = mongoose.model("PD", PDSchema);
