const mongoose = require("mongoose");

const BoundingSchema = new mongoose.Schema({
    PN: {
        type: String,
    },
    MiddlePoint:{
        type:Object
    },
    W:{
        type:Number
    },
    L:{
        type:Number
    },
    H:{
        type:Number
    },
    WAxis:{
        type:String
    },
    LAxis:{
        type:String
    },
    HAxis:{
        type:String
    },
    VolumNet:{
        type:Number
    },
    SurfaceNet:{
        type:Number
    },
    Volum:{
        type:Number
    },
    Surface:{
        type:Number
    },
    Size:{
        type:String,
        enum: ['Small','Medium','Large']
    },
    Shape:{
        type:String,
        enum:['CUBE','PLATE']
    },
    ChargableWeight:{
        type:Number
    },
    SurfaceTreatment:{
        type:String,
    }
});
module.exports = mongoose.model("Bounding", BoundingSchema);
