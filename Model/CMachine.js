const mongoose = require("mongoose");

const MachineSchema = new mongoose.Schema({
    Index:{
        type:Number
    },
    Name:{
        type:String,
        enum: ['4 Axis', '3 Axis', '5 Axis'],
    },
    Cost:{
        type:Number,
        default:0
    },
});
module.exports = mongoose.model("Machine", MachineSchema);
