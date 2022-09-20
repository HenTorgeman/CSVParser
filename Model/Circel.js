const mongoose = require("mongoose");
const Base = require("./Action");
const Point = require("./Point");


const circelSchema = Base.discriminator("Circel",
    new mongoose.Schema({
        radius: {
            type: Number,
            default: 0,
        },
        pointsA: {
            type: Object
        },
        pointsB: {
            type: Object
        },
        pointsC: {
            type: Object
        },
        points: {
            type: [Object]
        },

    })
);

module.exports = mongoose.model("Circel");
