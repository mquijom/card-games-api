'use strict'

var mongoose = require("mongoose");

var CardsModelSchema = new mongoose.Schema({
    card: {
        type: String
    },
    sign: {
        type: String
    },
    image_url: {
        type: String
    },
    code: {
        type: String
    }
})

module.exports = mongoose.model("cards", CardsModelSchema);