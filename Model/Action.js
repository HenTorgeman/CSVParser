const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema({
  index: {
    type: Number,
  },
  indexText: {
    type: String,
  },
  actionName: {
    type: String,
  },
  relatedActionIndex: {
    type: [String],
  },
});

module.exports = mongoose.model("Action", actionSchema);
