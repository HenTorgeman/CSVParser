const mongoose = require("mongoose");

const PartAcssesabilitynSchema = new mongoose.Schema({
    PN: {
        type: String,
    },
    FeatursNumber:{
        type: Number,
        default: 0,
    },
    StepRowsCount:{
        type: Number,
        default: 0,
    },
    MaximumCircleRadius:{
        type: Number,
        default: 0,
    },
    MinimumCircleRadius:{
        type: Number,
        default: 0,
    },
    AbNormalDirectionsNumber:{
        type: Number,
        default: 0,
    },
    MinimumDistanceBetweenCircles:{
        type: Number,
        default: 0,
    },
    MaximumDistanceBetweenCircles:{
        type: Number,
        default: 0,
    },

});
module.exports = mongoose.model("PartAcssesability", PartAcssesabilitynSchema);
