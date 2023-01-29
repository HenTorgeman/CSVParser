const mongoose = require("mongoose");

const KeyProcessesOptionSchema = new mongoose.Schema({
    PN:{
        type:String
    },
    Processes:{
        type:[Object]  
    },
    KeyMachine:{
        type:String
    },
    Time:{
        type:Number
    },
    Cost:{
        type:Number
    },
});
module.exports = mongoose.model("KeyProcessesOption", KeyProcessesOptionSchema);
