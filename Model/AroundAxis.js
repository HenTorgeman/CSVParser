const mongoose = require("mongoose");

const AroundAxisSchema = new mongoose.Schema({
    PN:{
        type:String
    },
    Directions: {
        type:[Object]
    },
    NumberOfMD:{
        type:Number,
        default:0,
    }
});
module.exports = mongoose.model("AroundAxis", AroundAxisSchema);
