const mongoose = require("mongoose");

const BoundingSchema = new mongoose.Schema({
    PN: {
        type: String,
    },
    MiddlePoint:{
        type:Object
    },
    W:{
        type:String
    },
    L:{
        type:String
    },
    H:{
        type:String
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
    MaterialWeight:{
        type:Number
    }
});
module.exports = mongoose.model("Bounding", BoundingSchema);
