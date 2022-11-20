const mongoose = require("mongoose");
const Base = require("./Action");
const Point = require("./Point");


const circelSchema = Base.discriminator("Circel",
    new mongoose.Schema({
        radius: {
            type: Number,
            default: 0,
        },
        PN:{
            type:String
        },
        key:{
            type:String
        },
        pointsA: {
            type: Object
        },
        pointsB: {
            type: Object
        },
        pointsC: {
            type: Object
        },
        AxisB: {
            type: String,
            // enum: ['X', 'Y', 'Z','-X','-Y','-Z','D'],
            // default: 'X'
        },
        AxisC: {
            type: String,
            // enum: ['X', 'Y', 'Z','-X','-Y','-Z','D'],
            // default: 'X'
        },
        GenAxisB: {
            type: String,
            // enum: ['X', 'Y', 'Z','D'],
            // default: 'X'
        },
        GenAxisC: {
            type: String,
            // enum: ['X', 'Y', 'Z','D'],
            // default: 'X'
        },
    })
);

module.exports = mongoose.model("Circel");
