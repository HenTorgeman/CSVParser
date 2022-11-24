const mongoose = require("mongoose");
const Base = require('./Action');
const Point = require("./Point");


const circelSchema = Base.discriminator("Circel",
    new mongoose.Schema({
        PN:{
            type:String
        },
        Radius: {
            type: Number,
            default: 0,
        },
        Key:{
            type:String
        },
        A: {
            type: Object
        },
        B: {
            type: Object
        },
        C: {
            type: Object
        },
        
        AxisB: {
            type: String,
        },
        AxisC: {
            type: String,
        },
        AbsulteAxisB: {
            type: String,
        },
        AbsulteAxisC: {
            type: String,
        },
        IsUsed:{
            type:Boolean,
            default:false,
        },
        IsComplex:{
            type:Boolean,
            default:false,
        },
    })
);

module.exports = mongoose.model("Circel");
