const mongoose = require("mongoose");

const CoCircelSchema = new mongoose.Schema({
    index: {
        type: Number,
        default: 0,
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
        enum: ['X', 'Y', 'Z','-X','-Y','-Z'],
        default: 'X'
    },
    AxisC: {
        type: String,
        enum: ['X', 'Y', 'Z','-X','-Y','-Z'],
        default: 'X'
    },
    RepreCount:{
        type:Number,
        default:0
    },


});
module.exports = mongoose.model("CoCircel", CoCircelSchema);
