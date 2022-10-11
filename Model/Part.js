const mongoose = require("mongoose");

const PartSchema = new mongoose.Schema({
    Index: {
        type: Number,
        default: 0,
    },
    PN: {
        type: String,
    },
    FilePath: {
        type: String,
    },
    CoCircels: {
        type: [Object]
    },
    boundingBox:{
        type: Number,
        default: 0,
    },
    MS:{
        type: Number,
        default: 2,
    },
    OriginalMS:{
        type: Number,
        default: 2,
    },
    directions:{
        type: [Object]
    }
});
module.exports = mongoose.model("Part", PartSchema);
