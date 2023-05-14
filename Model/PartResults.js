const mongoose = require("mongoose");

const PartResultsSchema = new mongoose.Schema({
    PN: {
        type: String,
    },
    HolesMinuets:{
        type:Number
    },
    HolesCost:{
        type:Number
    },
    ThreadsMinuets:{
        type:Number
    },
    ThreadsCost:{
        type:Number
    },
    RoughingMinuets:{
        type:Number
    },
    RoughingCost:{
        type:Number
    },
    FinishingMinuets:{
        type:Number
    },
    FinishingCost:{
        type:Number
    },
    HoldersMinuets:{
        type:Number
    },
    HoldersCost:{
        type:Number
    },
    Cost:{
        type:Number
    },
    LT:{
        type:Number
    },
    BatchTime:{
        type:Number
    },
    BatchCost:{
        type:Number
    },
});
module.exports = mongoose.model("PartResults", PartResultsSchema);
