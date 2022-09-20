const mongoose = require("mongoose");

const DirectionSchema = new mongoose.Schema({
    index: {
        type: Number,
        default: 0,
    },
    dirB: {
        type: Object
    },
    dirC: {
        type: Object
    },
    Circels: {
        type: [Object]
    },
    AxisB: {
        type: String,
        enum: ['X', 'Y', 'Z'],
        default: 'X'
    },
    AxisC: {
        type: String,
        enum: ['X', 'Y', 'Z'],
        default: 'X'

    },
});
module.exports = mongoose.model("Direction", DirectionSchema);
