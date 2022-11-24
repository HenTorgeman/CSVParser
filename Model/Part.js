const mongoose = require("mongoose");

const PartSchema = new mongoose.Schema({
    PN: {
        type: String,
    },
    Index: {
        type: Number,
        default: 0,
    },
    FilePath: {
        type: String,
    },
    boundingBox:{
        type: Number,
        default: 0,
    },
    MS:{
        type: Number,
        default: 0,
    },
    OriginalMS:{
        type: Number,
        default: 0,
    },
    Directions:{
        type: [Object]
    },
    DirectionStr:{
        type: String
    },
    FeatursNumber:{
        type: Number,
        default: 0,
    },
    
});
module.exports = mongoose.model("Part", PartSchema);
