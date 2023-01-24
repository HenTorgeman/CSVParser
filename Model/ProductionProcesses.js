const mongoose = require("mongoose");

const ProductionProcessesSchema = new mongoose.Schema({
    PN:{
        type:String
    },
    Index:{
        type:Number
    },
    ProcessName:{
        type:String,
        enum: ['Roughing', 'Finishing','FinishingHT', 'Holes','Semi-finishing', 'Holder']
    },
    Type:{
        type:String,
        enum: ['Key', 'Additional']
    },
    Machine:{
        type:Object,
    },
    Time:{
        type:Number
    },
    Cost:{
        type:Number
    },
});
module.exports = mongoose.model("ProductionProcesses", ProductionProcessesSchema);
