const mongoose = require("mongoose");

const RawMaterialSchema = new mongoose.Schema({
    RawMaterial: {
        type: String,
    },
    Material: {
        type: String,
        // enum:['Aluminum'],
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
