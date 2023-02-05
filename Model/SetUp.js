const mongoose = require("mongoose");

const SetUpSchema = new mongoose.Schema({
    //machines
    PN:{
        type:String
    },
    MachineName:{
        type:String,
        enum: ['4 Axis', '3 Axis', '5 Axis'],
    },
    SetUpsNumber:{
        type:Number
    },
});
module.exports = mongoose.model("SetUp", SetUpSchema);
