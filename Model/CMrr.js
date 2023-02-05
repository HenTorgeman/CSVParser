const mongoose = require("mongoose");

const MrrlSchema = new mongoose.Schema({
    Material: {
        type:String,
        // enum:['Aluminum'],
    },
    Size: {
            type:String,
            // enum: ['Small','Medium','Large']
    },
    ProcessName: {
        type:String,
        // enum: ['Roughing', 'Finishing','FinishingHT', 'Holes','Semi-finishing', 'Holder']
    },
    Lt:{
        //Min per hour
        type:Number,
    },
});
module.exports = mongoose.model("Mrr", MrrlSchema);
