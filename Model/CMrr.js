const mongoose = require("mongoose");

const MrrlSchema = new mongoose.Schema({
    Size: {
            type:String,
            enum: ['Small','Medium','Large']
    },
    ProcessName: {
        type:String,
    },
    Time:{
        //Min per hour
        type:Number,
        default:0
    },
});
module.exports = mongoose.model("Mrr", MrrlSchema);
