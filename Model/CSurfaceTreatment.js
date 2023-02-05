const mongoose = require("mongoose");

const SurfaceTreatmentSchema = new mongoose.Schema({
    Name: {
        type: String,
    },
    Material: {
        type: String,
    },
    Type: {
        type: String,
    },
    Color:{
        type: String,
    },
    Cost:{
        type: Number,
    },
    LeadTime:{
        type: Number,
    }, 
});
module.exports = mongoose.model("SurfaceTreatment", SurfaceTreatmentSchema);
