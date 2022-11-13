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
    Directions:{
        type: [Object]
    },
    RadiusCount:{
        type:Number
    },
    PinCount:{
        type:Number
    },
    HolesCount:{
        type:Number
    },
    OtherCount:{
        type:Number
    },
    CBorCount:{
        type:Number
    }
});
module.exports = mongoose.model("Part", PartSchema);
