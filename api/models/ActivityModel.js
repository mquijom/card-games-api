'use strict'

var mongoose = require("mongoose");

var ActivityModelSchema = new mongoose.Schema({
    game: {
        type: String
    },
    player: {
        from: {
            type: String
        },
        to: {
            type: String
        }
    },
    date_created: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model("activities", ActivityModelSchema);