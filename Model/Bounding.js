const mongoose = require("mongoose");

const BoundingSchema = new mongoose.Schema({
    PN: {
        type: String,
    },
    MinX:{
        type: Number,
    },
    MaxX:{
        type: Number,
    },
    MinY:{        
        type: Number,
    },
    MaxY:{        
        type: Number,
    },
    MinZ:{        
        type: Number,
    },
    MaxZ:{        
        type: Number,
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
    Wval:{
        type:Number
    },
    Lval:{
        type:Number
    },
    Hval:{
        type:Number
    }


    
});
module.exports = mongoose.model("Bounding", BoundingSchema);
