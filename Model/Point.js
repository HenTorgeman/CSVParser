const mongoose = require("mongoose");
const Base = require("./Action");

const pointSchema = Base.discriminator("Point",
    new mongoose.Schema({
        x: {
            type: Number,
            default: 0,
        },
        y: {
            type: Number,
            default: 0,
        },
        z: {
            type: Number,
            default: 0,
        }
    })
);

module.exports = mongoose.model("Point");
