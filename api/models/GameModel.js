'use strict'

var mongoose = require("mongoose");

var GameModelSchema = new mongoose.Schema({
    date_created: {
        type: Date,
        default: new Date()
    },
    created_by: {
        type: String
    },
    hidden_card: {},
    players: []
})

module.exports = mongoose.model("games", GameModelSchema);