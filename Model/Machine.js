const mongoose = require("mongoose");

const KeyMachineSchema = new mongoose.Schema({
    PN:{
        type:String
    },
    KeyMachine:{
        type:String,
        enum: ['4 Axis', '3 Axis', '5 Axis'],
    },
    SetUpsNumber:{
        type:Number
    },
    AroundAxisNumber:{
        type:Number
    }
});
module.exports = mongoose.model("KeyMachine", KeyMachineSchema);
