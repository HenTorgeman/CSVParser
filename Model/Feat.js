const mongoose = require("mongoose");

const FeatSchema = new mongoose.Schema({
     PN:{
        type:String
    },
    index: {
        type: Number,
        default: 0,
    },
    circels: {
        type: [Object]
    },
    type: {
        type: String,
        enum: ['HOLE', 'BHOLE', 'PIN', 'RADIUS','OTHER','CBOR'],
        default: 'HOLE'
    },
    AxisB: {
        type: String,
       
    },
    RepreCount:{
        type:Number,
        default:0
    },
    AbsulteAxisB: {
        type: String,
    },
    AbsulteAxisC: {
        type: String,
    },
    IsUsed:{
        type:Boolean,
        default:false,
      },
      IsComplex:{
        type:Boolean,
        default:false,
      },
    // AbsX:{

    // },
    // AbsY:{

    // },
    // AbsZ:{

    // },
    // Deep:{

    // },

    // AxisC: {
    //     type: String,
      
    // },

    // GenAxisC: {
    //     type: String,

    // },


});
module.exports = mongoose.model("Feat", FeatSchema);
