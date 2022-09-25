const mongoose = require("mongoose");

const PartSchema = new mongoose.Schema({
    index: {
        type: Number,
        default: 0,
    },
    Circels: {
        type: [Object]
    },
    type: {
        type: String,
        enum: ['HOLE', 'BHOLE', 'PIN', 'RADIUS'],
        default: 'X'
    },
    AxisC: {
        type: String,
        enum: ['X', 'Y', 'Z'],
        default: 'X'

    },
});
module.exports = mongoose.model("Part", PartSchema);
