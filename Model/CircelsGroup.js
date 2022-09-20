const mongoose = require("mongoose");

const circelsGroupSchema = new mongoose.Schema({
    index: {
        type: Number,
        default: 0,
    },
    face: {
        type: Number,
        default: 0,
    },
    circles: {
        type: [Object]
    },
    rowCount: {
        type: Number,
        default: 0,
    },
    radius: {
        type: Number,
        default: 0,
    },
    axisCoulmn: {
        type: String,
    },
});
module.exports = mongoose.model("CircelsGroup", circelsGroupSchema);
