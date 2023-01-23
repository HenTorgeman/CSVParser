const mongoose = require("mongoose");

const FeatSchema = new mongoose.Schema({
     PN:{
        type:String
    },
    Index: {
        type: Number,
        default: 0,
    },
    circels: {
        type: [Object]
    },
    type: {
        type: String,
        enum: ['HOLE', 'BHOLE','RADIUS','COMPLEX','CBOR','OTHER'],
        default: 'HOLE'
    },
    AxisB: {
        type: String,
    },
    AbsulteAxisB: {
        type: String,
    },  
    IsComplex:{
        type:Boolean,
        default:false,
    },
    IsPossibleAbsDirection:{
        type:Boolean,
        default:false,
     },
    RepreCount:{
        type:Number,
        default:0
    },
    MaxRadius:{
        type:Number,
        default:0
    },
    MinRadius:{
        type:Number,
        default:0
    },

});
module.exports = mongoose.model("Feat", FeatSchema);
