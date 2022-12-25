const mongoose = require("mongoose");

const CartesianPointSchema = new mongoose.Schema({
  index: {
    type: Number,
  },
  lable: {
    type: String,
  },
  point:{
    type:Object
  }
});

module.exports = mongoose.model("CartesianPoint", CartesianPointSchema);
