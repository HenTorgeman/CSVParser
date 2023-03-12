const mongoose = require("mongoose");

const PartInfoSchema = new mongoose.Schema({
    KeyMachine:{
        type: String
    },
    ComplexityLevel:{
        type:Number
    },
    STR:{
        type:Boolean
    },
    AroundAxis:{
        type: Number
    },
    KeyMachineSetups:{
        type: Number
    },
    OtherSetUps:{
        type: Number
    },
    MD:{
        type: Number
    },
    Holes:{
        type: Number
    },  
    Threads:{
        type: Number
    }
});
module.exports = mongoose.model("PartInfo", PartInfoSchema);
