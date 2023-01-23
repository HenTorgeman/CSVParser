const mongoose = require("mongoose");

const RawMaterialSchema = new mongoose.Schema({
    Name: {
        type: String,
    },
    Density: {
        type: Number,
        default: 0,
    },
    Price:{
        type: Number,
        default: 0,
    },
    LT:{
        type: Number,
        default: 0,
    },
    MrrOptions:{
        type:[Object]
    }, 
});
module.exports = mongoose.model("RawMaterial", RawMaterialSchema);
