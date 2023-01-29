const mongoose = require("mongoose");

const ProductionSetUpSchema = new mongoose.Schema({
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
    ProcessesNumber:{
        type:Number
    },
    Type:{
        type:String,
        enum: ['Key', 'Additional']
    },
    Machine:{
        type:String,
    },
    Time:{
        type:Number
    },
    Cost:{
        type:Number
    },
});
module.exports = mongoose.model("ProductionSetUp", ProductionSetUpSchema);
