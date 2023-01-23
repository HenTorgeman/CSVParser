const mongoose = require("mongoose");

const DirectionSchema = new mongoose.Schema({
    PN:{
        type:String
    },
    DirectionAxis: {
        type:String
    },
    AbsAxis: {
        type: String
    },
    Key:{
        type:String,
        default:""
    },
    Features: {
        type: [Object]
    },
    NumberOfFeat: {
        type: Number,
        default:0
    },

});
module.exports = mongoose.model("Direction", DirectionSchema);
