const mongoose = require("mongoose");

const CoCircelSchema = new mongoose.Schema({
    index: {
        type: Number,
        default: 0,
    },
    PN:{
        type:String
    },
    circels: {
        type: [Object]
    },
    type: {
        type: String,
        enum: ['HOLE', 'BHOLE', 'PIN', 'RADIUS'],
        default: 'HOLE'
    },
    AxisB: {
        type: String,
        enum: ['X', 'Y', 'Z','-X','-Y','-Z','D'],
        default: 'X'
    },
    AxisC: {
        type: String,
        enum: ['X', 'Y', 'Z','-X','-Y','-Z','D'],
        default: 'X'
    },
    RepreCount:{
        type:Number,
        default:0
    },
    GenAxisB: {
        type: String,
        enum: ['X', 'Y', 'Z','D'],
        default: 'X'
    },
    GenAxisC: {
        type: String,
        enum: ['X', 'Y', 'Z','D'],
        default: 'X'
    },


});
module.exports = mongoose.model("CoCircel", CoCircelSchema);
